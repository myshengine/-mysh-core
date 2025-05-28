import { Store } from "@data/store";
import { ISignalController } from "@execution/signal-controller";
import { GroupType } from "@execution/system-group";

export interface IStateTransitionData<T extends object = any> {
    fsmName: string;
    from: string;
    to: string;
    store: Store<T>;
}

export interface IState<T extends object> {
    name: string;
    transitions: Record<string, string>;
    onEnter?: GroupType<IStateTransitionData<T>>[];
    onExit?: GroupType<IStateTransitionData<T>>[];
    onTransition?: GroupType<IStateTransitionData<T>>[];
    subMachine?: IFSM<any>; 
}

export interface IFSMConfig<T extends object> {
    name: string;
    initialState: string;
    states: IState<T>[];
    store: Store<T>;
    guards?: Record<string, (store: Store<T>) => boolean>;
}

export interface IFSMHooks<T extends object> {
    onAnyTransition?: (from: string, to: string, store: Store<T>) => void;
    onEvent?: Record<string, (store: Store<T>) => void>;
    onUnhandledEvent?: (event: string, currentState: string, store: Store<T>) => void;
    onBlockedByGuard?: (from: string, to: string, store: Store<T>) => void;
    onEnterState?: (state: string, store: Store<T>) => void;
    onExitState?: (state: string, store: Store<T>) => void;
}

export interface IFSM<T extends Object> {
    name: string;
    currentState: IState<T>;
    currentStateName: string;
    previousState: string | undefined;
    states: IState<T>[];
    start(initialState?: string): void;
    listen(signalController: ISignalController): void
    canTransitTo(state: string): boolean;
    isIn(state: string): boolean;
    canSend(event: string): boolean;
    transitTo(state: string): void;
    send(event: string): void;
    stop(): void;
}