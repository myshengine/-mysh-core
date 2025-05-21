import { ComponentFilter, IEntity } from '@data/entity';
import { IEntityStorage } from './models';
import { compileFilter } from './utils';
import { Filtered } from '@data/filtered';
import { ComponentsRaritySorter } from '@data/component';

export class EntityStorage implements IEntityStorage {
    private _entities: Map<string, IEntity> = new Map();

    public addEntity(entity: IEntity): void {
        const { uuid, name } = entity;
        if (this._entities.has(uuid)) {
            throw new Error(`Entity with UUID [${name}-${uuid}] already exists in the storage.`);
        }
        this._entities.set(uuid, entity);
    }

    public removeEntity(uuid: string): IEntity | undefined {
        const removed = this._entities.get(uuid);
        if (!removed) return;

        this._entities.delete(uuid);
        return removed;
    }

    public getEntity(uuid: string): IEntity | undefined {
        return this._entities.get(uuid);
    }

    public getAllEntities(): IEntity[] {
        return Array.from(this._entities.values());
    }

    public getActiveEntities(): IEntity[] {
        return Array.from(this._entities.values()).filter((e) => e.active);
    }

    public getInactiveEntities(): IEntity[] {
        return Array.from(this._entities.values()).filter((e) => !e.active);
    }

    public filter(filter: ComponentFilter, withDisabled?: boolean): Filtered {
        let allEntities = withDisabled
            ? this.getAllEntities()
            : this.getActiveEntities();
    
        if (!filter.excludes) filter.excludes = [];
    
        if (filter?.includes.length || filter?.excludes.length) {
            const sortedIncludes = ComponentsRaritySorter.sortByRarity(filter.includes);
            const sortedExcludes = filter.excludes.length
                ? ComponentsRaritySorter.sortByRarity(filter.excludes)
                : undefined;
    
            const filterFunction = compileFilter(sortedIncludes, sortedExcludes);
            allEntities = allEntities.filter(filterFunction);
        }
    
        return new Filtered(allEntities);
    }

}
