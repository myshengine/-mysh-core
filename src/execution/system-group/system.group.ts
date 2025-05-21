import { Utils } from '@shared/utils';
import { IGroupOption, ISystemGroup, ISystemProvider, SystemData, IGroupSortedOption } from './models';
import { SystemType } from '@logic/system';
import { Provider, ServiceContainer } from '@containers/services-container';

/**
 * @description In groups, the order of execution of Systems is established.
 * Each group is bound to a Signal and can receive data from the Signal for subsequent transmission to the System.
 * When the Signal is triggered, the `execute` method of all Systems in the group is invoked.
 * Systems are executed sequentially, in the order specified in `setup` or according to the `order` property.
 *
 * Within a group, it is also possible to extend the functionality of Systems slightly by:
 * - Defining an extension for the filter,
 * - Repeating the invocation a certain number of times, or
 * - Specifying conditions under which the System may or may not be invoked when its turn arrives,
 *   in which case execution will proceed further.
 *
 * Groups can also specify dependencies on other services by overriding the service implementations
 * defined globally in the App.
 *
 * @example
 * ```ts
 * class MyGroup extends Group<MyData> {
 *     public setup(data: MyData): IGroupOption[] {
 *         return [
 *             // Registration of the System, which will be executed first.
 *             // All Systems are provided via `this.provide`
 *             // The first argument is the System class, and the second is the data to be passed to the System, if needed.
 *             {
 *                 instance: this.provide(SomeSystemOne, null),
 *             },
 *             // Registration of the System with data passed in, which will be executed second.
 *             {
 *                 instance: this.provide(SomeSystemTwo, data),
 *             },
 *             // Registration of the System and extension of its filter with an additional Component.
 *             {
 *                 instance: this.provide(SomeSystemThree),
 *                 includes: [SomeComponent]
 *             },
 *             // Registration of the System and overriding its behavior.
 *             // By specifying `repeat`, the System will be executed the specified number of times
 *             // before proceeding to the next System.
 *             // By specifying `canExecute`, the System will only execute if the condition returns true.
 *             {
 *                 instance: this.provide(SomeSystemFour),
 *                 repeat: 3,
 *                 canExecute: (data) => // ... some condition, must return true or false,
 *             },
 *         ];
 *     };
 *
 *     public setupDependencies(): ServiceDescriptor<any>[] {
 *         return [
 *             {
 *                 provide: SomeAbstractService, useClass: SomeServiceImplementation
 *             },
 *         ];
 *      }
 * }
 * ```
 */
export abstract class SystemGroup<T = any> implements ISystemGroup<T> {
    public get uuid(): string {
        return this._uuid;
    }

    private _uuid: string = Utils.uuid();

    /**
     * @description The method should return an array of objects containing data for creating Systems.
     * @param data - Data received from the Signal that may be used in Systems.
     */
    public abstract setup(data: T): IGroupOption[];

    public sorted(data: T): IGroupSortedOption[] {
        const providers = this.setup(data);
        const orderStep = 10000;

        providers.forEach((provider, index) => {
            if (provider.withDisabled === undefined) provider.withDisabled = false;
            if (provider.includes === undefined) provider.includes = [];
            if (provider.excludes === undefined) provider.excludes = [];
            if (!provider.repeat) provider.repeat = 1;
            if (!provider.canExecute) provider.canExecute = () => true;
            if (provider.order === undefined) provider.order = (index + 1) * orderStep;
        });

        return providers.sort((a, b) => (a.order || 0) - (b.order || 0)) as IGroupSortedOption[];
    }

    public registerGroupDependencies(): void {
        const providers = this.setupDependencies();
        ServiceContainer.instance.registerModule(this.uuid, providers);
    }

    public provide<T extends SystemType<any, any>>(
        system: T,
        data: SystemData<InstanceType<T>>,
    ): ISystemProvider {
        return {
            system,
            data,
        };
    }

    protected setupDependencies(): Provider[] {
        return [];
    }
}
