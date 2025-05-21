import { ComponentsRaritySorter } from '@data/component';
import { Component, ComponentType } from '../component/component';
import { ComponentFilter, IEntity } from './models';
import { ComponentCollection } from './component-collection';

/**
 * @description
 * The base Entity class.
 * Implements the IEntity interface.
 * It contains a collection of Components and provides methods to manipulate them.
 *
 * @example
 * ```ts
 * // Create an entity with two components
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
export class Entity implements IEntity {
    /**
     * @description
     * The unique identifier of the entity.
     */
    public get uuid(): string {
        return this._uuid;
    }

    /**
     * @description
     * The name of the entity.
     */
    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    /**
     * @description
     * Whether the entity is currently active.
     */
    public get active(): boolean {
        return this._active;
    }

    public set active(value: boolean) {
        this._active = value;
    }

    /**
     * @description
     * A list of all components attached to the entity.
     */
    public get components(): Component[] {
        return this._components.items;
    }

    /**
     * @description
     * A list of all disabled components attached to the entity.
     */
    public get disabledComponents(): Component[] {
        return this._disabledComponents.items;
    }

    private _active: boolean = true;
    private readonly _components: ComponentCollection = new ComponentCollection();
    private readonly _disabledComponents: ComponentCollection = new ComponentCollection();

    constructor(
        private readonly _uuid: string,
        private _name: string = 'Entity',
    ) {}

    /**
     * @description
     * Adds a component to the entity.
     *
     * @param component The component instance to be added.
     * @param enabled Whether the component should be initially enabled or disabled. Defaults to true.
     */
    public addComponent(component: Component, enabled: boolean = true): void {
        const ctor = this.extractConstructor(component);

        if (this._components.has(ctor) || this._disabledComponents.has(ctor)) {
            throw new Error(
                `Component of type ${ctor.name} already exists in entity [${this._name}-${this._uuid}]`,
            );
        }

        if (enabled) {
            this._components.set(component);
            ComponentsRaritySorter.increment(ctor);
        } else {
            this._disabledComponents.set(component);
            ComponentsRaritySorter.decrement(ctor);
        }
    }

    /**
     * @description Gets a component by its constructor function.
     * @param ctor The constructor function of the component.
     * @returns The component instance, or null if no such component was found.
     */
    public getComponent<T extends Component>(ctor: ComponentType<T>): T {
        const component = this._components.get(ctor);
        if (!component) {
            throw new Error(
                `Component of type ${ctor.name} is not found in [${this.name}-${this.uuid}].`,
            );
        }
        return component as T;
    }

    /**
     * @description Checks whether the entity has at least one of the specified components.
     * @param types An array of component constructors.
     * @returns True if the entity has at least one of the specified components, false otherwise.
     */
    public hasComponents(types: ComponentType<any>[]): boolean {
        return types.every((component) => {
            const c = this._components.get(component);
            return !!c;
        });
    }

    /**
     * @description Removes a component from the entity.
     * @param ctor The constructor function of the component to be removed.
     * @returns The removed component instance.
     */
    public removeComponent(ctor: ComponentType<any>): Component {
        let removed: Component | undefined;

        if (this._components.has(ctor)) {
            removed = this._components.get(ctor);
            this._components.delete(ctor);
        } else if (this._disabledComponents.has(ctor)) {
            removed = this._disabledComponents.get(ctor);
            this._disabledComponents.delete(ctor);
        }

        if (!removed) {
            throw new Error(
                `Component type ${ctor.name} does not exist in entity [${this._name}-${this._uuid}]`,
            );
        }

        ComponentsRaritySorter.decrement(ctor);

        return removed;
    }

    /**
     * @description
     * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
     *
     * @param ctor The constructor function of the component to be enabled.
     */
    public enableComponent<T extends Component>(ctor: ComponentType<T>): void {
        if (!this._disabledComponents.has(ctor)) {
            throw new Error(
                `Cannot enable component of type ${ctor.name} - it does not exist or is already enabled.`,
            );
        }
        const comp = this._disabledComponents.get(ctor)!;
        this._disabledComponents.delete(ctor);
        this._components.set(comp);

        ComponentsRaritySorter.increment(ctor);
    }

    /**
     * @description
     * Disables a component. If the component doesn't exist or is already disabled, throws an error.
     *
     * @param ctor The constructor function of the component to be disabled.
     */
    public disableComponent<T extends Component>(ctor: ComponentType<T>): void {
        if (!this._components.has(ctor)) {
            throw new Error(
                `Cannot disable component of type ${ctor.name} - it does not exist or is already disabled.`,
            );
        }
        const comp = this._components.get(ctor)!;
        this._components.delete(ctor);
        this._disabledComponents.set(comp);

        ComponentsRaritySorter.decrement(ctor);
    }

    /**
     * @description Disables all components on the entity.
     */
    public disableAllComponents(): void {
        for (const comp of this._components.items) {
            this._disabledComponents.set(comp);
            ComponentsRaritySorter.decrement(comp.constructor);
        }
        this._components.clear();
    }

    /**
     * @description Enables all components that were previously disabled.
     */
    public enableAllComponents(): void {
        for (const comp of this._disabledComponents.items) {
            this._components.set(comp);
            ComponentsRaritySorter.increment(comp.constructor);
        }
        this._disabledComponents.clear();
    }

    /**
     * Checks whether the entity meets the specified filtering criteria.
     * @param filter - The filter criteria.
     * @returns True if the entity satisfies the filter, false otherwise.
     */
    public isSatisfiedFilter(filter: ComponentFilter): boolean {
        const includes = filter.includes || [];
        const excludes = filter.excludes || [];

        return this.hasComponents(includes) && (!excludes.length || !this.hasComponents(excludes));
    }

    private extractConstructor<T extends Component>(component: Component): ComponentType<T> {
        return component.constructor as ComponentType<T>;
    }
}
