import { Token } from '@containers/services-container';
import { ComponentFilter } from '@data/entity';
import { IEntityStorage } from '@data/entity-storage';
import { Filtered } from '@data/filtered';

/**
 * Represents a set of actions performed on entities.
 * All game logic should be implemented in Systems.
 * Systems are executed based on filtering Entities by their Components.
 * Systems must be registered in a Group, which is responsible for calling them in turn
 * and can also pass additional data into the System.
 *
 * @example
 * ```ts
 * // System implements the ISystem interface.
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
export interface ISystem<TData> {
    /**
     * @description Gets the identifier of the group to which this system belongs.
     */
    groupId: string;

    /**
     * @description Sets the context for the system.
     */
    setContext(groupId: string, entityStorage: IEntityStorage): void;

    /**
     * Runs the System.
     *
     * @param groupId - The identifier of the group to which this system belongs.
     * @param data - The data to be passed to the `execute` method.
     * @param externalFilter - An additional filter for the system.
     * @param withDisabled - Whether to include entities marked as disabled.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    run(
        data: TData,
        externalFilter: ComponentFilter,
        withDisabled: boolean,
    ): Promise<void>;

    /**
     * Filters entities by their components.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    filter(filter: ComponentFilter): Filtered;

    /**
     * The entry point for the system, where all logic is performed.
     *
     * @param data - Additional data passed from the Group.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    execute(data: TData): void | Promise<void>;

    /**
     * Gets a dependency from the ServiceContainer.
     *
     * @param token - The token of the dependency.
     * @returns The dependency.
     */
    getDependency<T>(token: Token<T>): T
}
