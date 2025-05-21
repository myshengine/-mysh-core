import { Filtered } from '@data/filtered';
import { ISystem } from './model';
import { ComponentFilter } from '@data/entity';
import { IEntityStorage } from '@data/entity-storage';
import { ServiceContainer, Token } from '@containers/services-container';

/**
 * Represents a set of actions performed on entities.
 * Implements the ISystem interface.
 * All game logic should be implemented in Systems.
 * Systems are executed based on filtering Entities by their Components.
 * Systems must be registered in a Group, which is responsible for calling them in turn
 * and can also pass additional data into the System.
 *
 * @example
 * ```ts
 * export class ExampleSystem extends System {
 *
 *     // The entry point to the system.
 *     public async execute() {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              // ... logic here ...
 *         })
 *     }
 * }
 *
 * // Some systems can receive additional data in the execute method.
 * // This data is passed from the Group when the system is run.
 * // For example, you can pass an object's movement speed through the data parameter.
 * export class VelocitySystem extends System<Vec2> {
 *     // The entry point to the system.
 *     public async execute(data: Vec2) {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              const position = entity.getComponent(PositionComponent);
 *              position.x += data.x;
 *              position.y += data.y;
 *         })
 *     }
 * }
 * ```
 */
export abstract class System<TData = any> implements ISystem<TData> {
    /**
     * @description Gets the identifier of the group to which this system belongs.
     */
    public get groupId(): string {
        return this._groupId;
    }
    
    private _groupId: string = '';
    protected withDisabled: boolean = false;
    protected externalFilter!: ComponentFilter;
    private _entityStorage!: IEntityStorage;


    public setContext(groupId: string, entityStorage: IEntityStorage): void {
        this._groupId = groupId;
        this._entityStorage = entityStorage;
    }
    
    /**
     * Runs the System.
     *
     * @param data - The data to be passed to the `execute` method.
     * @param externalFilter - An additional filter for the system.
     * @param withDisabled - Whether to include entities marked as disabled.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    public async run(
        data: TData,
        externalFilter: ComponentFilter,
        withDisabled: boolean,
    ): Promise<void> {
        this.externalFilter = externalFilter;
        this.withDisabled = withDisabled;

        await this.execute(data);
    }

    /**
     * Filters entities by their components.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    public filter(filter: ComponentFilter): Filtered {
        const mixedFilter = {
            includes: [...filter.includes, ...(this.externalFilter.includes || [])],
            excludes: [...(filter.excludes || []), ...(this.externalFilter.excludes || [])],
        };

        return this._entityStorage.filter(mixedFilter, this.withDisabled);
    }

    /**
     * Filters entities by their components without group filter mixin.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    public cleanFilter(filter: ComponentFilter): Filtered {
        return this._entityStorage.filter(filter, this.withDisabled);
    }

    /**
     * The entry point for the system, where all logic is performed.
     *
     * @param data - Additional data passed from the Group.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    public abstract execute(data: TData): void | Promise<void>;

    /**
     * Gets a dependency from the ServiceContainer.
     *
     * @param token - The token of the dependency.
     * @returns The dependency.
     */
    public getDependency<T>(token: Token<T>): T {
        return ServiceContainer.instance.get(token, this.groupId);
    }
}
