/**
 * @description A utility for creating a promise that can be resolved or rejected later.
 *
 * @param <T> The type of the value to be returned by the promise.
 *
 * @example
 * const deferred = new DeferredPromise();
 * setTimeout(() => {
 *     deferred.resolve('Hello World!');
 * }, 100);
 *
 * deferred.promise.then(console.log); // Hello World!
 *
 */
export class DeferredPromise<T> {
    /*
     * @description - The promise that will be resolved or rejected later.
     */
    public promise: Promise<T>;

    /*
     * @description - The function used to resolve the promise.
     */
    public resolve!: (value: T | PromiseLike<T>) => void;

    /*
     * @description - The function used to reject the promise.
     */
    public reject!: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<T>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }

    /*
     * @description - Resolves all promises in an array with the same data.
     */
    public static resolveAll<K>(deferred: DeferredPromise<any>[], data: K): void {
        deferred.forEach((d) => d.resolve(data));
    }

    /*
     * @description - Rejects all promises in an array with the same reason.
     */
    public static rejectAll(deferred: DeferredPromise<any>[], reason?: any): void {
        deferred.forEach((d) => d.reject(reason));
    }

    /*
     * @description - Returns a promise that resolves when all promises in the array are resolved.
     */
    public static all(deferred: DeferredPromise<any>[]): Promise<any[]> {
        return Promise.all(deferred.map((d) => d.promise));
    }

    /*
     * @description - Returns a promise that resolves when all promises in the array are settled.
     */
    public static allSettled(deferred: DeferredPromise<any>[]): Promise<any[]> {
        return Promise.allSettled(deferred.map((d) => d.promise));
    }

    /*
     * @description - Returns a promise that resolves when any promise in the array is resolved.
     */
    public static race(deferred: DeferredPromise<any>[]): Promise<any> {
        return Promise.race(deferred.map((d) => d.promise));
    }
}
