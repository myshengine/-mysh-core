export type Listener<T> = (state: T) => void;

export type Middleware<T> = (
    state: T,
    update: Partial<T>,
    next: (state: T, update: Partial<T>) => T
) => T;

export type Validator<T> = (update: Partial<T>) => boolean | string;

export interface Transaction<T> {
    apply: (state: T) => T;
    rollback: (state: T) => T;
}

export interface StoreOptions<T> {
    middleware?: Middleware<T>[];
    validators?: Validator<T>[];
    historySize?: number;
}
