import { Store } from "@data/store";
import { IFSM, IFSMConfig, IFSMHooks, IState, IStateTransitionData } from "./models";
import { ISignalConfig, ISignalController } from "@execution/signal-controller";
import { OnStateEnterSignal, OnStateExitSignal, OnStateTransitionSignal } from "./signals";
import { GroupType } from "@execution/system-group";
import { ISignal } from "@shared/signal";

export class FSM<T extends object> implements IFSM<T> {

    public get name(): string {
        return this._name;
    }
    
    public get currentState(): IState<T> {
        return this._currentState;
    }
    
    public get currentStateName(): string {
        return this._currentState.name;
    }
    
    public get previousState(): string | undefined {
        return this._prevStateName;
    }
    
    public get states(): IState<T>[] {
        return Array.from(this._states.values());
    }

    public get store(): Store<T> {
        return this._store;
    }
    
    private _name!: string;
    private _initialState!: string;
    private _currentState!: IState<T>;
    private _prevStateName?: string;
    private _states: Map<string, IState<T>> = new Map();
    private _hooks?: IFSMHooks<T>;
    private _store!: Store<T>;
    private _guards: Record<string, (store: Store<T>) => boolean>;
    private _started = false;

    constructor(config: IFSMConfig<T>, hooks?: IFSMHooks<T>) {
        this._name = config.name;
        this._hooks = hooks;
        this._store = config.store;
        this._guards = config.guards ?? {};
        this._initialState = config.initialState;
        this.setupStates(config.states);
    }

    public listen(signalController: ISignalController): void {
        const configs: ISignalConfig[] = [];

        this._states.forEach(state => {
            if (state.onEnter) {
                configs.push(this.formatGroups(state, state.onEnter, OnStateEnterSignal));
            }

            if (state.onExit) {
                configs.push(this.formatGroups(state, state.onExit, OnStateExitSignal));
            }

            if (state.onTransition) {
                configs.push(this.formatGroups(state, state.onTransition, OnStateTransitionSignal));
            }
        });

        configs.forEach(signalConfig => {
            signalConfig.executions.forEach(execution => {
                signalController.inject(signalConfig.signal, execution);
            });
        })

        // SignalController.factory(configs, signalController);
    }

    private formatGroups(
        state: IState<T>, 
        groups: GroupType<IStateTransitionData>[], 
        signal: ISignal<IStateTransitionData>
    ): ISignalConfig {
        const executions = groups.map(g => ({group: g, canExecute: () => this.currentStateName === state.name}));

        return {
            signal,
            executions
        }
    }

    public start(initialState?: string): void {
        if (this._started) return;
        this._started = true;
        this.setupInitialState(initialState ?? this._initialState);
    }

    public canTransitTo(targetState: string): boolean {
        return Object.values(this._currentState.transitions).some(state => state === targetState);
    }

    public canSend(event: string): boolean {
        const target = this._currentState.transitions[event] ?? this._currentState.transitions["*"];
        return !!target;
    }

    public isIn(state: string): boolean {
        return this._currentState.name === state;
    }

    public transitTo(state: string): void {
        if (!this.canTransitTo(state)) {
            throw new Error(`Cannot transit from ${this._currentState.name} to ${state}`);
        }

        if (this.isGuardBlocked(state)) {
            return;
        }

        this._currentState.subMachine?.stop();

        OnStateExitSignal.dispatch({
            from: this._currentState.name,
            to: state,
            store: this._store
        });

        this._hooks?.onExitState?.(this._currentState.name, this._store);

        OnStateTransitionSignal.dispatch({
            from: this._currentState.name,
            to: state,
            store: this._store
        });

        const next = this._states.get(state);
        if (!next) throw new Error(`[FSM:${this._name}] Target state "${state}" not found`);

        this._prevStateName = this._currentState.name;
        this._currentState = next;

        this._hooks?.onAnyTransition?.(this._prevStateName, state, this._store);
        this._hooks?.onEnterState?.(this._currentState.name, this._store);

        OnStateEnterSignal.dispatch({
            from: this._currentState.name,
            to: state,
            store: this._store
        });

        this._currentState.subMachine?.start();
    }

    public send(event: string): void {
        const target = this._currentState.transitions[event] ?? this._currentState.transitions["*"];
        if (!target) {
            this._hooks?.onUnhandledEvent?.(event, this._currentState.name, this._store);
            throw new Error(`[FSM:${this._name}] No transition for event "${event}" in state "${this._currentState.name}"`);
        }

        this._hooks?.onEvent?.[event]?.(this._store);
        this.transitTo(target);
    }

    public stop(): void{
        this._currentState.subMachine?.stop();

        OnStateExitSignal.dispatch({
            from: this._currentState.name,
            to: this._currentState.name,
            store: this._store
        });

        this._hooks?.onExitState?.(this._currentState.name, this._store);
        this._started = false;
    }

    private isGuardBlocked(targetState: string): boolean {
        const matchingEvent = Object.entries(this._currentState.transitions).find(([, s]) => s === targetState)?.[0];
        const guard = matchingEvent ? this._guards[matchingEvent] : undefined;

        if (guard && !guard(this._store)) {
            this._hooks?.onBlockedByGuard?.(this._currentState.name, targetState, this._store);
            return true;
        }

        return false;
    }

    private setupStates(states: IState<T>[]): void {
        for (const state of states) {
            this._states.set(state.name, state);
        }
    }

    private setupInitialState(name: string): void {
        const state = this._states.get(name);
        if (!state) throw new Error(`State ${name} not found`);

        this._currentState = state;
        this._hooks?.onEnterState?.(this._currentState.name, this._store);

        OnStateEnterSignal.dispatch({
            from: this._currentState.name,
            to: this._currentState.name,
            store: this._store
        });

        this._currentState.subMachine?.start();
    }
}
