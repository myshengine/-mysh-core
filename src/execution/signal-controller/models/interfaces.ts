import { IExecutable } from "@execution/executor";
import { GroupType } from "@execution/system-group";
import { ISignal } from "@shared/signal";


export interface IListenerConfig<T> extends Partial<IExecutable<any>> {
    group: GroupType<T>;
    order?: number;
}

export interface ISignalInjector {
    inject<T>(signal: ISignal<T>, config: IListenerConfig<any>): void;
}

export interface ISignalConfig {
    signal: ISignal<any>;
    executions: IListenerConfig<any>[];
}

/**
 * @description Manages Signal-Group bindings.
 * The SignalController handles signal subscriptions and their execution.
 * It is used for managing System Groups.
 */
export interface ISignalController extends ISignalInjector {
    /**
     * @description Adds a binding between a signal and a group.
     *
     * @param signal - The signal.
     * @param config - The group configuration.
     */
    inject<T>(signal: ISignal<T>, config: IListenerConfig<T>): void;

    /**
     * @description Triggers a signal with the provided data.
     *
     * @param signal - The signal.
     * @param data - The data to be passed when triggering the signal.
     */
    dispatch<T>(signal: ISignal<T>, data: T): void;

    /**
     * @description Subscribes to signals.
     */
    subscribe(): void;

    /**
     * @description Unsubscribes from signals.
     */
    unsubscribe(): void;

    /**
     * @description Clears all groups.
     */
    stop(): void;

    /**
     * @description Pauses all groups.
     */
    pause(): void;

    /**
     * @description Resumes all groups.
     */
    resume(): void;
}
