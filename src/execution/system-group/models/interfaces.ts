import { ComponentType } from '@data/component';
import { ISystem, SystemType } from '@logic/system';
import { SystemData } from './types';

export interface ISystemOptions {
    withDisabled: boolean;
    includes: ComponentType<any>[];
    excludes: ComponentType<any>[];
    repeat: number;
    canExecute: () => boolean;
}

export interface ISystemExternalData {
    data: any;
}

export interface ISystemProvider extends ISystemExternalData {
    system: SystemType<any, any>;
}

export interface ISystemInstance extends ISystemExternalData, ISystemOptions {
    system: ISystem<any>;
    groupId: string;
}

export interface IGroupOption extends Partial<ISystemOptions> {
    order?: number;
    instance?: ISystemProvider;
}

export interface IGroupSortedOption extends ISystemOptions {
    order: number;
    instance: ISystemProvider;
}

export interface ISystemGroup<T = any> {
    uuid: string;
    registerGroupDependencies(): void;
    setup(data: T): IGroupOption[];
    sorted(data: T): IGroupSortedOption[];
    provide<T extends SystemType<any, any>>(
        system: T,
        data: SystemData<InstanceType<T>>,
    ): ISystemProvider;
}
