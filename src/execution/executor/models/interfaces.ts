import { ISystemGroup } from '@execution/system-group/models';

export interface IExecutable<T> {
    canExecute: (data: T) => boolean;
}

export interface IExecutionItem extends IExecutable<any> {
    group: ISystemGroup<any>;
    order?: number;
}

export interface IExecutor {
    groups: ISystemGroup<any>[];
    execute(data: any, executions: IExecutionItem[]): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
}
