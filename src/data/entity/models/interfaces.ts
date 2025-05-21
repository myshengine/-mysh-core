import { Component, ComponentType } from '../../component/component';

export interface ComponentFilter {
    includes: ComponentType<any>[];
    excludes?: ComponentType<any>[];
}

/**
 * Entity interface.
 * It contains a collection of components and provides methods
 * to manipulate them.
 *
 * @example
 * ```ts
 * // Create an entity with two components
 * // Entity class implements this interface.
 * const entity = new Entity('my-entity');
 * entity.addComponent(new PositionComponent());
 * entity.addComponent(new VelocityComponent());
 *
 * // Get the position component
 * const position = entity.getComponent(PositionComponent);
 *
 * // Remove the velocity component
 * entity.removeComponent(VelocityComponent);
 *
 * // Disable all components on the entity
 * entity.disableAllComponents();
 */
export interface IEntity {
    /**
     * @description
     * The unique identifier of the entity.
     */
    readonly uuid: string;

    /**
     * @description
     * The name of the entity.
     */
    name: string;

    /**
     * @description
     * Whether or not the entity is active.
     */
    active: boolean;

    /**
     * @description
     * A list of components attached to the entity.
     */
    readonly components: Component[];

    /**
     * @description
     * A list of components that are currently disabled.
     */
    readonly disabledComponents: Component[];

    /**
     * @description
     * Adds a component to the entity.
     *
     * @param component The component instance to be added.
     * @param enabled Whether the component should be initially enabled or disabled. Default value is specified by implementation. Defaults to true in Entity class.
     */
    addComponent(component: Component, enabled?: boolean): void;

    /**
     * @description Gets a component by its constructor function.
     * @param ctor The constructor function of the component.
     * @returns The component instance, or null if no such component was found.
     */
    getComponent<T extends Component>(ctor: ComponentType<T>): T;

    /**
     * @description Checks whether the entity has at least one of the specified components.
     * @param types An array of component constructors.
     * @returns True if the entity has at least one of the specified components, false otherwise.
     */
    hasComponents(types: ComponentType<any>[]): boolean;

    /**
     * @description Removes a component from the entity.
     * @param ctor The constructor function of the component to be removed.
     * @returns The removed component instance.
     */
    removeComponent(ctor: ComponentType<any>): Component;

    /**
     * @description
     * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
     *
     * @param ctor The constructor function of the component to be enabled.
     */
    enableComponent<T extends Component>(ctor: ComponentType<T>): void;

    /**
     * @description
     * Disables a component. If the component doesn't exist or is already disabled, throws an error.
     *
     * @param ctor The constructor function of the component to be disabled.
     */
    disableComponent<T extends Component>(ctor: ComponentType<T>): void;

    /**
     * @description Disables all components on the entity.
     */
    disableAllComponents(): void;

    /**
     * @description Enables all components that were previously disabled.
     */
    enableAllComponents(): void;

    /**
     * Checks whether the entity meets the specified filtering criteria.
     * @param filter - The filter criteria.
     * @returns True if the entity satisfies the filter, false otherwise.
     */
    isSatisfiedFilter(filter: ComponentFilter): boolean;
}
