import { ComponentFilter, IEntity } from '@data/entity';
import { Filtered } from '@data/filtered';

export interface IEntityStorage {
    addEntity(entity: IEntity): void;
    removeEntity(uuid: string): IEntity | undefined;
    getEntity(uuid: string): IEntity | undefined;
    getAllEntities(): IEntity[];
    getActiveEntities(): IEntity[];
    getInactiveEntities(): IEntity[];
    filter(filter: ComponentFilter, withDisabled?: boolean): Filtered;
}
