import { Component, ComponentType } from '@data/component';

export class ComponentCollection {
    public get items(): Component[] {
        return this._items;
    }

    private _items: Component[] = [];

    public set(component: Component): void {
        this._items.push(component);
    }

    public get<T extends Component>(type: ComponentType<T>): T | undefined {
        return this._items.find((component) => component instanceof type) as T;
    }

    public has<T extends Component>(type: ComponentType<T>): boolean {
        return !!this.get(type);
    }

    public delete(type: ComponentType<any>): boolean {
        const component = this.get(type);

        if (component) {
            this._items = this.items.filter((component) => component.constructor !== type);
        }

        return !!component;
    }

    public clear(): void {
        this._items.length = 0;
    }
}
