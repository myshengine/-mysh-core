import { IEntity } from '@data/entity';

export type EntityIterationCallback = (entity: IEntity, index?: number) => void | Promise<void>;
