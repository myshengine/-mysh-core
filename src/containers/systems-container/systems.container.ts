import { ISystem, SystemType } from '@logic/system';
import { ISystemsContainer } from './models';

export class SystemsContainer implements ISystemsContainer {
    private _cache: Map<SystemType<any, any>, ISystem<any>> = new Map();

    public get(ctor: SystemType<any, any>): ISystem<any> {
        let item = this._cache.get(ctor);
        if (!item) {
            item = new ctor() as ISystem<any>;
            this._cache.set(ctor, item);
        }

        return item;
    }
}
