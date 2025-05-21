import { ISystem } from './interfaces';

export type SystemType<TClass extends ISystem<TData>, TData> = new (...args: any[]) => TClass;
