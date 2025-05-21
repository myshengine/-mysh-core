import { ISystemsContainer } from '@containers/systems-container';
import { IExecutionItem, IExecutor } from './models';
import { ISystemGroup, ISystemInstance } from '@execution/system-group';
import { EntityStorage } from '@data/entity-storage';
import { ServiceContainer } from '@containers/services-container';

export class Executor implements IExecutor {
    public get groups(): ISystemGroup<any>[] {
        return this._groups;
    }

    private _isPaused: boolean = false;
    private _resumePromise: Promise<void> | null = null;
    private _resolveResume: (() => void) | null = null;

    private _queue: ISystemInstance[] = [];
    private _groups: ISystemGroup<any>[] = [];
    private _currentGroup: ISystemGroup<any> | undefined;

    constructor(
        private _systemsContainer: ISystemsContainer,
        private _entityStorage: EntityStorage
    ) {}

    public async execute(data: any, executions: IExecutionItem[]): Promise<void> {
        this._queue = this.setExecutionQueue(data, executions);

        while (this._queue.length > 0) {
            if (this._isPaused) {
                await this.waitForResume();
            }
            const item = this._queue.shift();
            if (item) {
                const canExecute = item.canExecute();

                if (this._currentGroup?.uuid !== item.groupId) {
                    this._currentGroup = this._groups.find((x) => x.uuid === item.groupId);
                }

                if (canExecute) {
                    const filter = { includes: item.includes, excludes: item.excludes };
                    item.system.setContext(item.groupId, this._entityStorage);
                    
                    ServiceContainer.instance.getDependencyForSystem(item.groupId, item.system);
                    
                    const returnType = item.system.run(item.data, filter, item.withDisabled);
                    await returnType;
                }
            }
        }
    }

    /**
     * @description Stops all groups.
     */
    public stop(): void {
        this._queue = [];
    }

    /**
     * @description Pauses all groups.
     */
    public pause(): void {
        if (!this._isPaused) {
            this._isPaused = true;
        }
    }

    /**
     * @description Resumes all groups.
     */
    public resume(): void {
        if (this._isPaused) {
            this._isPaused = false;
            if (this._resolveResume) {
                this._resolveResume();
                this._resolveResume = null;
                this._resumePromise = null;
            }
        }
    }

    private waitForResume(): Promise<void> {
        if (!this._resumePromise) {
            this._resumePromise = new Promise<void>((resolve) => {
                this._resolveResume = resolve;
            });
        }
        return this._resumePromise;
    }

    private setExecutionQueue(data: any, executions: IExecutionItem[]): ISystemInstance[] {
        const queue: ISystemInstance[] = [];

        executions.forEach((execution) => {
            if (execution.canExecute(data)) {
                const group = execution.group.sorted(data);
                const groupId = execution.group.uuid;
                this._groups.push(execution.group);

                group.forEach((provider) => {
                    const system = this._systemsContainer.get(provider.instance.system);
                    for (let i = 0; i < provider.repeat; i++) {
                        queue.push({
                            ...provider,
                            data: provider.instance.data,
                            groupId,
                            system,
                        });
                    }
                });
            }
        });

        return queue;
    }
}
