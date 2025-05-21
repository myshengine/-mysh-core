import { IEntity } from '@data/entity';
import { EntityIterationCallback } from './models';

/**
 * @description
 * Represents a collection of entities that have been filtered based on certain criteria.
 *
 * @example
 * ```typescript
 * // Create a new Filtered object with some entities
 * const filteredEntities = new Filtered([entity1, entity2]);
 *
 * // Iterate over each entity using forEach method
 * filteredEntities.forEach((entity) => {
 *   console.log(`Entity UUID: ${entity.uuid}`);
 * });
 *
 * // Iterate over each entity sequentially using asynchronous sequential method
 * await filteredEntities.sequential(async (entity) => {
 *   console.log(`Entity Name: ${entity.name}`);
 * });
 *
 * // Iterate over each entity in parallel using asynchronous parallel method
 * await filteredEntities.parallel(async (entity) => {
 *   console.log(`Entity Active Status: ${entity.active}`);
 * });
 * ```
 */
export class Filtered {
    /**
     * @description
     * Returns the total number of entities in the collection.
     */
    public get count(): number {
        return this._entities.length;
    }

    /**
     * @description
     * Returns an array containing all the entities in the collection.
     */
    public get items(): IEntity[] {
        return this._entities;
    }

    constructor(private _entities: IEntity[] = []) {}

    /**
     * @description
     * Iterates through each entity and calls the provided callback function for each entity.
     *
     * @param callback - The callback function to be called for each entity.
     */
    public forEach(callback: EntityIterationCallback): void {
        for (let i = 0; i < this._entities.length; i++) {
            callback(this._entities[i], i);
        }
    }

    /**
     * @description
     * Iterates through each entity asynchronously and calls the provided callback function for each entity.
     *
     * @param callback - The callback function to be called for each entity.
     * @returns A promise that resolves when all iterations are completed.
     */
    public async sequential(callback: EntityIterationCallback): Promise<void> {
        let index = 0;
        for (const entity of this._entities) {
            await callback(entity, index);
            index += 1;
        }
    }

    /**
     * @description
     * Iterates through each entity asynchronously and calls the provided callback function for each entity in parallel.
     *
     * @param callback - The callback function to be called for each entity.
     * @returns A promise that resolves when all iterations are completed.
     */
    public async parallel(callback: EntityIterationCallback): Promise<void> {
        const promises = this._entities.map(callback);
        await Promise.all(promises);
    }
}
