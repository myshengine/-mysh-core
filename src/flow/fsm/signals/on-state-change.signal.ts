import { Signal } from "@shared/signal";
import { IStateTransitionData } from "../models";

export const OnStateEnterSignal = new Signal<IStateTransitionData>();
export const OnStateExitSignal = new Signal<IStateTransitionData>();
export const OnStateTransitionSignal = new Signal<IStateTransitionData>();
