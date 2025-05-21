import { ClassProvider, FactoryProvider } from "./interfaces";

export type Constructor<T = any> = new (...args: any[]) => T;

export type Factory<T = any> = () => T;

export type Token<T = any> = Constructor<T> | symbol;

export type Provider<T = any> = ClassProvider<T> | FactoryProvider<T>;