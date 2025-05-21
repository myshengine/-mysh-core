import { Signal } from "@shared/signal";

export interface IUpdateLoopData {
    deltaTime: number;
    speedMultiplier: number;
    multipliedDelta: number;
}

export const OnUpdateSignal = new Signal<IUpdateLoopData>();