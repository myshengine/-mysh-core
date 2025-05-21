import { Utils } from '@shared/utils';
import { Disposable, ISignal } from './models';

/**
 * @description A signal is a way to communicate between different parts of the application.
 *
 * @example
 * ```ts
 * import { Signal } from '@initiator/signal';
 *
 * // Create a new signal
 * const mySignal = new Signal<string>();
 *
 * // Subscribe to the signal
 * mySignal.subscribe((data) => console.log('Received data:', data));
 *
 * // Dispatch the signal with some data
 * mySignal.dispatch('Hello world!');
 * ```
 */
export class Signal<T> implements ISignal<T> {
    private listeners: Array<{
        callback: (data: T) => void;
        once: boolean;
    }> = [];

    public get name(): string | undefined {
        return this._name;
    }

    public get uuid(): string {
        return this._uuid;
    }

    private _uuid: string = Utils.uuid();

    constructor(private _name: string = 'Signal') {}

    /**
     * @description Subscribes to the signal.
     * @param callback - The callback function that will be called when the signal is dispatched.
     * @returns - A disposable object that can be used to unsubscribe from the signal.
     */
    public subscribe(callback: (data: T) => void): Disposable {
        this.listeners.push({ callback, once: false });

        return {
            dispose: () => {
                this.unsubscribe(callback);
            },
        };
    }

    /**
     * @description Subscribes to the signal only once.
     * @param callback - The callback function that will be called when the signal is dispatched.
     * @returns - A disposable object that can be used to unsubscribe from the signal.
     */
    public once(callback: (data: T) => void): Disposable {
        this.listeners.push({ callback, once: true });

        return {
            dispose: () => {
                this.unsubscribe(callback);
            },
        };
    }

    /**
     * @description Unsubscribes from the signal.
     * @param callback - The callback function that was subscribed to the signal.
     */
    public unsubscribe(callback: (data: T) => void): void {
        this.listeners = this.listeners.filter((listener) => listener.callback !== callback);
    }

    /**
     * @description Dispatches the signal.
     * @param data - The data that will be passed to the callback functions.
     */
    public dispatch(data: T): void {
        const onceListeners: Array<(data: T) => void> = [];

        for (const listener of this.listeners) {
            listener.callback(data);

            if (listener.once) {
                onceListeners.push(listener.callback);
            }
        }

        if (onceListeners.length > 0) {
            this.listeners = this.listeners.filter((l) => !onceListeners.includes(l.callback));
        }
    }
}
