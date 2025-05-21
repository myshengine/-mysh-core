import { ComponentType } from './component';

/**
 * @description
 * A utility class that keeps track of how often each component is used in the game.
 * Need for the component sorter to be able to sort components based on their rarity.
 */
export class ComponentsRaritySorter {
    private static _componentFrequency: Map<ComponentType<any>, number> = new Map();

    /**
     * @description
     * Increment the frequency of a given component type.
     *
     * @param component The component to increment the frequency for.
     */
    public static increment(component: ComponentType<any>): void {
        const currentCount = this._componentFrequency.get(component) ?? 0;
        this._componentFrequency.set(component, currentCount + 1);
    }

    /**
     * @description
     * Decrement the frequency of a given component type. If it reaches zero,
     * remove it from the map.
     *
     * @param component The component to decrement the frequency for.
     */
    public static decrement(component: ComponentType<any>): void {
        const currentCount = this._componentFrequency.get(component) ?? 0;
        if (currentCount > 1) {
            this._componentFrequency.set(component, currentCount - 1);
        } else {
            this._componentFrequency.delete(component);
        }
    }

    /**
     * @description
     * Get the rarity of a given component type.
     *
     * @param component The component to get the rarity for.
     */
    public static rarity(component: ComponentType<any>): number {
        return this._componentFrequency.get(component) ?? 0;
    }

    /**
     * @description
     * Sort an array of component types by their rarity.
     *
     * @param components An array of component types to sort.
     * @returns The sorted array of component types.
     */
    public static sortByRarity(components: ComponentType<any>[]): ComponentType<any>[] {
        return [...components].sort((a, b) => this.rarity(a) - this.rarity(b));
    }
}
