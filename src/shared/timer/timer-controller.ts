import { Timer } from './timer';
import { Interval } from './interval';
import { ISleep, ITimerController, IUpdatable } from './models';
import { DeferredPromise } from '@shared/deferred-promise';
import { Utils } from '@shared/utils';

/**
 * @description A controller for managing timers and intervals.
 * Unlike the standard setTimeout and setInterval, the timers created depend on the game's FPS.
 * That is, if the game runs at 60 FPS, the timer will trigger once per second.
 *
 * @example
 * ```ts
 * import { TimerController } from '@shared/timer';
 *
 * const timerController = new TimerController();
 *
 * // Create a timer
 * const timerId = timerController.setTimeout(() => console.log('Timer complete'), 1000);
 *
 * // Remove the timer by its ID
 * timerController.clear(timerId);
 *
 * // Create an interval
 * const intervalId = timerController.setInterval(() => console.log('Interval tick'), 500);
 *
 * // Remove the interval by its ID
 * timerController.clear(intervalId);
 *
 * // Stop all timers and intervals
 * timerController.stop();
 * ```
 */
export class TimerController implements ITimerController {
    private _updatables: Map<string, IUpdatable> = new Map<string, IUpdatable>();

    /**
     * @description Creates a new timer.
     * @param callback - The function that will be called when the timer completes.
     * @param duration - The duration of the timer in milliseconds.
     * @returns The ID of the created timer.
     */
    public setTimeout(callback: () => void, duration: number): string {
        const id = Utils.uuid();
        const timer = new Timer(id, this, callback, duration);

        this._updatables.set(id, timer);
        return id;
    }

    /**
     * @description Creates a new interval.
     * @param callback - The function that will be called on each tick of the interval.
     * @param duration - The duration of each interval tick in milliseconds.
     * @returns The ID of the created interval.
     */
    public setInterval(callback: () => void, duration: number): string {
        const id = Utils.uuid();
        const interval = new Interval(id, callback, duration);

        this._updatables.set(id, interval);
        return id;
    }

    /**
     * @description Creates a new code execution delay.
     * @param duration - The delay duration in milliseconds.
     * @returns An object with the methods `wait` and `resolve`. The `wait` method returns a promise that resolves after the specified duration.
     * The `resolve` method immediately resolves the promise and removes the timer from the controller.
     */
    public sleep(duration: number): ISleep {
        const deferredPromise = new DeferredPromise<void>();
        const id = this.setTimeout(() => deferredPromise.resolve(), duration);

        return {
            id,
            wait: async () => await deferredPromise.promise,
            resolve: () => {
                deferredPromise.resolve();
                this.clear(id);
            },
        };
    }

    /**
     * @description Stops the timer or interval by its ID.
     * @param uuid - The ID of the timer or interval.
     */
    public clear(uuid: string): void {
        if (this._updatables.has(uuid)) {
            this._updatables.delete(uuid);
        }
    }

    /**
     * @description Updates all timers and intervals.
     * @param deltaTime - The time between frames in milliseconds.
     */
    public update(deltaTime: number): void {
        const updatables = Array.from(this._updatables.values());
        updatables.forEach((updatable) => updatable.update(deltaTime));
    }
}
