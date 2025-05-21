import { Listener, Middleware, StoreOptions, Transaction, Validator } from './models';

export class Store<T extends object> {
    private listeners: Set<Listener<T>> = new Set();
    private middleware: Middleware<T>[] = [];
    private validators: Validator<T>[] = [];
    private history: T[] = [];
    private historyIndex: number = -1;
    private historySize: number;

    constructor(
        private _data: T,
        options: StoreOptions<T> = {}
    ) {
        this.middleware = options.middleware || [];
        this.validators = options.validators || [];
        this.historySize = options.historySize || 10;
        this.pushToHistory(this._data);
    }

    /**
     * Get current state using Proxy to prevent direct mutations
     */
    public get state(): T {
        return new Proxy(this._data, {
            get: (target, prop) => {
                const value = target[prop as keyof T];
                return value instanceof Object ? new Proxy(value, {}) : value;
            },
            set: () => {
                console.warn('Direct state mutation is not allowed. Use setState instead.');
                return false;
            }
        });
    }

    /**
     * Subscribe to state changes
     * @param listener Callback function to be called when state changes
     * @returns Unsubscribe function
     */
    public subscribe(listener: Listener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Update state using callback
     * @param callback Function that returns partial update
     * @throws Error if validation fails
     */
    public setState(callback: (current: T) => Partial<T>): void {
        const update = callback(this.state);
        
        // Validate updates
        for (const validator of this.validators) {
            const result = validator(update);
            if (result !== true) {
                throw new Error(typeof result === 'string' ? result : 'Validation failed');
            }
        }

        // Apply middleware chain
        let finalState = this.middleware.length ? this._data : { ...this._data, ...update };
        for (const middleware of this.middleware) {
            finalState = middleware(finalState, update, this.applyUpdate);
        }

        this._data = finalState;
        this.pushToHistory(finalState);
        this.notifyListeners();
    }

    /**
     * Execute a transaction that can be rolled back
     * @param transaction Transaction object with apply and rollback functions
     */
    public transaction(transaction: Transaction<T>): void {
        const previousState = this.state;
        try {
            this._data = transaction.apply(this.state);
            this.pushToHistory(this._data);
            this.notifyListeners();
        } catch (error) {
            this._data = transaction.rollback(previousState);
            this.notifyListeners();
            throw error;
        }
    }

    /**
     * Undo last change
     * @returns true if undo was successful
     */
    public undo(): boolean {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this._data = this.history[this.historyIndex];
            this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * Redo previously undone change
     * @returns true if redo was successful
     */
    public redo(): boolean {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this._data = this.history[this.historyIndex];
            this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * Reset store to initial state
     * @param initialData Initial data to reset to
     */
    public reset(initialData: T = {} as T): void {
        this._data = initialData;
        this.history = [];
        this.historyIndex = -1;
        this.pushToHistory(this._data);
        this.notifyListeners();
    }

    private applyUpdate(state: T, update: Partial<T>): T {
        return { ...state, ...update };
    }

    private pushToHistory(state: T): void {
        this.historyIndex++;
        this.history = this.history
            .slice(0, this.historyIndex)
            .concat([{ ...state }]);

        if (this.history.length > this.historySize) {
            this.history = this.history.slice(-this.historySize);
            this.historyIndex = this.history.length - 1;
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }
}
