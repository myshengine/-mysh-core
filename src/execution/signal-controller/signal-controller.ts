
import { ISignal, Disposable } from '@shared/signal';
import { IListenerConfig, ISignalConfig, ISignalController } from './models/interfaces';
import { IExecutionItem } from '@execution/executor/models';
import { Executor } from '@execution/executor';
import { ISystemsContainer } from '@containers/systems-container';
import { EntityStorage } from '@data/entity-storage';

/**
 * @description Manages Signal-Group bindings.
 * The SignalController handles signal subscriptions and their execution.
 * It is used for managing System Groups.
 */
export class SignalController implements ISignalController {
    private _pairs: Map<ISignal, IExecutionItem[]> = new Map();
    private _disposables: Disposable[] = [];
    private _executors: Executor[] = [];

    constructor(
        private _systemStorage: ISystemsContainer, 
        private _entityStorage: EntityStorage
    ) {}

    /**
     * @description Creates bindings between a signal and a group using a configuration.
     *
     * @param configs - Signal-Group bindings.
     * @param controller - The controller for creating group instances.
     */
    public static factory(configs: ISignalConfig[], controller: ISignalController): void {
        configs.forEach((config) => {
            config.executions.forEach((execution) => {
                controller.inject(config.signal, execution);
            });
        });
    }

    /**
     * @description Overrides bindings between a signal and a group using a configuration.
     *
     * @param original - The original Signal-Group bindings.
     * @param overrides - The overriding Signal-Group bindings.
     * @returns The new Signal-Group bindings.
     */
    public static override(original: ISignalConfig[], overrides: ISignalConfig[]): ISignalConfig[] {
        const signalMap = new Map<ISignal<any>, ISignalConfig>();

        for (const config of original) {
            signalMap.set(config.signal, { ...config, executions: [...config.executions] });
        }

        for (const override of overrides) {
            if (signalMap.has(override.signal)) {
                const existingConfig = signalMap.get(override.signal)!;
                const executionMap = new Map<number, IListenerConfig<any>>();

                for (const execution of existingConfig.executions) {
                    executionMap.set(execution.order ?? executionMap.size + 1, { ...execution });
                }

                for (const execution of override.executions) {
                    if (execution.order !== undefined && executionMap.has(execution.order)) {
                        executionMap.set(execution.order, { ...execution });
                    } else {
                        executionMap.set(execution.order ?? executionMap.size + 1, {
                            ...execution,
                        });
                    }
                }

                existingConfig.executions = Array.from(executionMap.values()).sort(
                    (a, b) => a.order! - b.order!,
                );
            } else {
                signalMap.set(override.signal, { ...override });
            }
        }

        return Array.from(signalMap.values());
    }

    /**
     * @description Adds a binding between a signal and a group.
     *
     * @param signal - The signal.
     * @param config - The group configuration.
     */
    public inject<T>(signal: ISignal<T>, config: IListenerConfig<T>): void {
        const pair = this._pairs.get(signal) || [];
        const group = new config.group();
        group.registerGroupDependencies();
        const canExecute = config.canExecute ? config.canExecute : (data: T) => true;

        const instance: IExecutionItem = {
            group,
            canExecute,
            order: config.order ? config.order : 0,
        };

        pair.push(instance);

        pair.forEach((item, index) => {
            if (!item.order) item.order = (index + 1) * 10000;
        });

        const sortedPair = pair.sort((a, b) => (a.order || 0) - (b.order || 0));

        this._pairs.set(signal, sortedPair);
    }

    /**
     * @description Triggers a signal with the provided data.
     *
     * @param signal - The signal.
     * @param data - The data to be passed when triggering the signal.
     */
    public dispatch<T>(signal: ISignal<T>, data: T): void {
        signal.dispatch(data);
    }

    /**
     * @description Subscribes to signals.
     */
    public subscribe(): void {
        const signals = Array.from(this._pairs.keys());

        signals.forEach((signal) => {
            const disposable = signal.subscribe(async (data) => {
                const instances = this._pairs.get(signal) || [];
                const executor = new Executor(this._systemStorage, this._entityStorage);
                this._executors.push(executor);
                await executor.execute(data, instances);
                const index = this._executors.indexOf(executor);
                this._executors.splice(index, 1);
            });

            this._disposables.push(disposable);
        });
    }

    /**
     * @description Unsubscribes from signals.
     */
    public unsubscribe(): void {
        this._disposables.forEach((d) => d.dispose());
        this._pairs.clear();
        this.stop();
        this._executors.length = 0;
    }

    /**
     * @description Clears all groups.
     */
    public stop(): void {
        this._executors.forEach((e) => e.stop());
    }

    /**
     * @description Pauses all groups.
     */
    public pause(): void {
        this._executors.forEach((e) => e.pause());
    }

    /**
     * @description Resumes all groups.
     */
    public resume(): void {
        this._executors.forEach((e) => e.resume());
    }
}
