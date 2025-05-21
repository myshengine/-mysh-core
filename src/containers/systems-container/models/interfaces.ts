import { ISystem, SystemType } from '@logic/system';

export interface ISystemsContainer {
    get(ctor: SystemType<any, any>): ISystem<any>;
}
