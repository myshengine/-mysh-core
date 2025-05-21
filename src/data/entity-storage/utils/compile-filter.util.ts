import { ComponentType } from '@data/component';
import { IEntity } from '@data/entity';

type CompileFilterReturs = (entity: IEntity) => boolean;

export const compileFilter = (
    includes: ComponentType<any>[],
    excludes?: ComponentType<any>[],
): CompileFilterReturs => {
    return (entity: IEntity): boolean => {
        if (!entity.hasComponents(includes)) return false;

        if (excludes && entity.hasComponents(excludes)) return false;

        return true;
    };
};
