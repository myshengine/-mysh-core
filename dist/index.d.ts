declare type Callback = (...args: any[]) => void;

export declare interface ClassProvider<T = any> {
    provide: Token<T>;
    useClass: Constructor<T>;
    immutable?: boolean;
}

/**
 * @description
 * A Component is a plain JavaScript object. It does not have to implement any interface or extend any base class.
 *
 * Components are used as data containers for Entities in your game. They contain all the information about
 * some aspect of your Entity's state and behavior. For example, you might define Components such as Position,
 * Velocity, Health, Inventory, etc., each with their own set of properties and methods specific to those aspects.
 *
 * Components should only hold data without any functionality.
 *
 * In Mysh, Components are typically created using classes. This allows them to be easily extended and customized
 * by adding additional properties.
 *
 * @example
 * ```ts
 * // Define a component called "Position" with x,y coordinates:
 * export class Position {
 *   public x!: number;
 *   public y!: number;
 *
 *   constructor(x: number, y: number) {
 *     this.x = x;
 *     this.y = y;
 *   }
 * }
 *
 * // Create an entity with a position component:
 * const playerEntity = new Entity();
 * playerEntity.addComponent(new Position(10, 20));
 *
 * // Access the position component from the entity:
 * const positionComponent = playerEntity.getComponent(Position);
 * console.log(positionComponent.x); // Output: 10
 *
 * // Update the position component values:
 * positionComponent.x += 5;
 * positionComponent.y -= 3;
 *
 * ```
 */
export declare type Component = object & {
    length?: never;
    constructor: any;
};

export declare interface ComponentFilter {
    includes: ComponentType<any>[];
    excludes?: ComponentType<any>[];
}

/**
 * @description
 * A utility class that keeps track of how often each component is used in the game.
 * Need for the component sorter to be able to sort components based on their rarity.
 */
export declare class ComponentsRaritySorter {
    private static _componentFrequency;
    /**
     * @description
     * Increment the frequency of a given component type.
     *
     * @param component The component to increment the frequency for.
     */
    static increment(component: ComponentType<any>): void;
    /**
     * @description
     * Decrement the frequency of a given component type. If it reaches zero,
     * remove it from the map.
     *
     * @param component The component to decrement the frequency for.
     */
    static decrement(component: ComponentType<any>): void;
    /**
     * @description
     * Get the rarity of a given component type.
     *
     * @param component The component to get the rarity for.
     */
    static rarity(component: ComponentType<any>): number;
    /**
     * @description
     * Sort an array of component types by their rarity.
     *
     * @param components An array of component types to sort.
     * @returns The sorted array of component types.
     */
    static sortByRarity(components: ComponentType<any>[]): ComponentType<any>[];
}

/**
 * @description A Component Type is a constructor function that creates instances of a specific Component type.
 *
 * @template T The type of the Component being defined.
 *
 * @param args Any arguments required to create an instance of the Component.
 *
 * @returns An instance of the specified Component type.
 *
 */
export declare type ComponentType<T extends Component> = new (...args: any[]) => T;

export declare type Constructor<T = any> = new (...args: any[]) => T;

/**
 * @description A utility for creating a promise that can be resolved or rejected later.
 *
 * @param <T> The type of the value to be returned by the promise.
 *
 * @example
 * const deferred = new DeferredPromise();
 * setTimeout(() => {
 *     deferred.resolve('Hello World!');
 * }, 100);
 *
 * deferred.promise.then(console.log); // Hello World!
 *
 */
export declare class DeferredPromise<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    constructor();
    static resolveAll<K>(deferred: DeferredPromise<any>[], data: K): void;
    static rejectAll(deferred: DeferredPromise<any>[], reason?: any): void;
    static all(deferred: DeferredPromise<any>[]): Promise<any[]>;
    static allSettled(deferred: DeferredPromise<any>[]): Promise<any[]>;
    static race(deferred: DeferredPromise<any>[]): Promise<any>;
}

declare type Disposable_2 = {
    dispose: () => void;
};
export { Disposable_2 as Disposable }

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
export declare class Entity implements IEntity {
    private readonly _uuid;
    private _name;
    /**
     * @description
     * The unique identifier of the entity.
     */
    get uuid(): string;
    /**
     * @description
     * The name of the entity.
     */
    get name(): string;
    set name(value: string);
    /**
     * @description
     * Whether the entity is currently active.
     */
    get active(): boolean;
    set active(value: boolean);
    /**
     * @description
     * A list of all components attached to the entity.
     */
    get components(): Component[];
    /**
     * @description
     * A list of all disabled components attached to the entity.
     */
    get disabledComponents(): Component[];
    private _active;
    private readonly _components;
    private readonly _disabledComponents;
    constructor(_uuid: string, _name?: string);
    /**
     * @description
     * Adds a component to the entity.
     *
     * @param component The component instance to be added.
     * @param enabled Whether the component should be initially enabled or disabled. Defaults to true.
     */
    addComponent(component: Component, enabled?: boolean): void;
    /**
     * @description Gets a component by its constructor function.
     * @param ctor The constructor function of the component.
     * @returns The component instance, or null if no such component was found.
     */
    getComponent<T extends Component>(ctor: ComponentType<T>): T;
    /**
     * @description Checks whether the entity has at least one of the specified components.
     * @param types An array of component constructors.
     * @returns True if the entity has at least one of the specified components, false otherwise.
     */
    hasComponents(types: ComponentType<any>[]): boolean;
    /**
     * @description Removes a component from the entity.
     * @param ctor The constructor function of the component to be removed.
     * @returns The removed component instance.
     */
    removeComponent(ctor: ComponentType<any>): Component;
    /**
     * @description
     * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
     *
     * @param ctor The constructor function of the component to be enabled.
     */
    enableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Disables a component. If the component doesn't exist or is already disabled, throws an error.
     *
     * @param ctor The constructor function of the component to be disabled.
     */
    disableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description Disables all components on the entity.
     */
    disableAllComponents(): void;
    /**
     * @description Enables all components that were previously disabled.
     */
    enableAllComponents(): void;
    /**
     * Checks whether the entity meets the specified filtering criteria.
     * @param filter - The filter criteria.
     * @returns True if the entity satisfies the filter, false otherwise.
     */
    isSatisfiedFilter(filter: ComponentFilter): boolean;
    private extractConstructor;
}

declare type EntityIterationCallback = (entity: IEntity, index?: number) => void | Promise<void>;

export declare class EntityStorage implements IEntityStorage {
    private _entities;
    addEntity(entity: IEntity): void;
    removeEntity(uuid: string): IEntity | undefined;
    getEntity(uuid: string): IEntity | undefined;
    getAllEntities(): IEntity[];
    getActiveEntities(): IEntity[];
    getInactiveEntities(): IEntity[];
    filter(filter: ComponentFilter, withDisabled?: boolean): Filtered;
}

export declare class Executor implements IExecutor {
    private _systemsContainer;
    private _entityStorage;
    get groups(): ISystemGroup<any>[];
    private _isPaused;
    private _resumePromise;
    private _resolveResume;
    private _queue;
    private _groups;
    private _currentGroup;
    constructor(_systemsContainer: ISystemsContainer, _entityStorage: EntityStorage);
    execute(data: any, executions: IExecutionItem[]): Promise<void>;
    /**
     * @description Stops all groups.
     */
    stop(): void;
    /**
     * @description Pauses all groups.
     */
    pause(): void;
    /**
     * @description Resumes all groups.
     */
    resume(): void;
    private waitForResume;
    private setExecutionQueue;
}

export declare type Factory<T = any> = () => T;

export declare interface FactoryProvider<T = any> {
    provide: Token<T>;
    useFactory: Factory<T>;
    immutable?: boolean;
}

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
declare class Filtered {
    private _entities;
    /**
     * @description
     * Returns the total number of entities in the collection.
     */
    get count(): number;
    /**
     * @description
     * Returns an array containing all the entities in the collection.
     */
    get items(): IEntity[];
    constructor(_entities?: IEntity[]);
    /**
     * @description
     * Iterates through each entity and calls the provided callback function for each entity.
     *
     * @param callback - The callback function to be called for each entity.
     */
    forEach(callback: EntityIterationCallback): void;
    /**
     * @description
     * Iterates through each entity asynchronously and calls the provided callback function for each entity.
     *
     * @param callback - The callback function to be called for each entity.
     * @returns A promise that resolves when all iterations are completed.
     */
    sequential(callback: EntityIterationCallback): Promise<void>;
    /**
     * @description
     * Iterates through each entity asynchronously and calls the provided callback function for each entity in parallel.
     *
     * @param callback - The callback function to be called for each entity.
     * @returns A promise that resolves when all iterations are completed.
     */
    parallel(callback: EntityIterationCallback): Promise<void>;
}

export declare class FSM<T extends object> implements IFSM<T> {
    get name(): string;
    get currentState(): IState<T>;
    get currentStateName(): string;
    get previousState(): string | undefined;
    get states(): IState<T>[];
    get store(): Store<T>;
    private _name;
    private _initialState;
    private _currentState;
    private _prevStateName?;
    private _states;
    private _hooks?;
    private _store;
    private _guards;
    private _started;
    constructor(config: IFSMConfig<T>, hooks?: IFSMHooks<T>);
    listen(signalController: ISignalController): void;
    private formatGroups;
    start(initialState?: string): void;
    canTransitTo(targetState: string): boolean;
    canSend(event: string): boolean;
    isIn(state: string): boolean;
    transitTo(state: string): void;
    send(event: string): void;
    stop(): void;
    private isGuardBlocked;
    private setupStates;
    private setupInitialState;
}

export declare type GroupData<T extends ISystemGroup> = T extends ISystemGroup<infer U> ? U : never;

export declare type GroupType<T> = new (...args: any[]) => ISystemGroup<T>;

/**
 * Entity interface.
 * It contains a collection of components and provides methods
 * to manipulate them.
 *
 * @example
 * ```ts
 * // Create an entity with two components
 * // Entity class implements this interface.
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
export declare interface IEntity {
    /**
     * @description
     * The unique identifier of the entity.
     */
    readonly uuid: string;
    /**
     * @description
     * The name of the entity.
     */
    name: string;
    /**
     * @description
     * Whether or not the entity is active.
     */
    active: boolean;
    /**
     * @description
     * A list of components attached to the entity.
     */
    readonly components: Component[];
    /**
     * @description
     * A list of components that are currently disabled.
     */
    readonly disabledComponents: Component[];
    /**
     * @description
     * Adds a component to the entity.
     *
     * @param component The component instance to be added.
     * @param enabled Whether the component should be initially enabled or disabled. Default value is specified by implementation. Defaults to true in Entity class.
     */
    addComponent(component: Component, enabled?: boolean): void;
    /**
     * @description Gets a component by its constructor function.
     * @param ctor The constructor function of the component.
     * @returns The component instance, or null if no such component was found.
     */
    getComponent<T extends Component>(ctor: ComponentType<T>): T;
    /**
     * @description Checks whether the entity has at least one of the specified components.
     * @param types An array of component constructors.
     * @returns True if the entity has at least one of the specified components, false otherwise.
     */
    hasComponents(types: ComponentType<any>[]): boolean;
    /**
     * @description Removes a component from the entity.
     * @param ctor The constructor function of the component to be removed.
     * @returns The removed component instance.
     */
    removeComponent(ctor: ComponentType<any>): Component;
    /**
     * @description
     * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
     *
     * @param ctor The constructor function of the component to be enabled.
     */
    enableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description
     * Disables a component. If the component doesn't exist or is already disabled, throws an error.
     *
     * @param ctor The constructor function of the component to be disabled.
     */
    disableComponent<T extends Component>(ctor: ComponentType<T>): void;
    /**
     * @description Disables all components on the entity.
     */
    disableAllComponents(): void;
    /**
     * @description Enables all components that were previously disabled.
     */
    enableAllComponents(): void;
    /**
     * Checks whether the entity meets the specified filtering criteria.
     * @param filter - The filter criteria.
     * @returns True if the entity satisfies the filter, false otherwise.
     */
    isSatisfiedFilter(filter: ComponentFilter): boolean;
}

export declare interface IEntityStorage {
    addEntity(entity: IEntity): void;
    removeEntity(uuid: string): IEntity | undefined;
    getEntity(uuid: string): IEntity | undefined;
    getAllEntities(): IEntity[];
    getActiveEntities(): IEntity[];
    getInactiveEntities(): IEntity[];
    filter(filter: ComponentFilter, withDisabled?: boolean): Filtered;
}

export declare interface IExecutable<T> {
    canExecute: (data: T) => boolean;
}

export declare interface IExecutionItem extends IExecutable<any> {
    group: ISystemGroup<any>;
    order?: number;
}

export declare interface IExecutor {
    groups: ISystemGroup<any>[];
    execute(data: any, executions: IExecutionItem[]): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
}

export declare interface IFSM<T extends Object> {
    name: string;
    currentState: IState<T>;
    currentStateName: string;
    previousState: string | undefined;
    states: IState<T>[];
    start(initialState?: string): void;
    listen(signalController: ISignalController): void;
    canTransitTo(state: string): boolean;
    isIn(state: string): boolean;
    canSend(event: string): boolean;
    transitTo(state: string): void;
    send(event: string): void;
    stop(): void;
}

export declare interface IFSMConfig<T extends object> {
    name: string;
    initialState: string;
    states: IState<T>[];
    store: Store<T>;
    guards?: Record<string, (store: Store<T>) => boolean>;
}

export declare interface IFSMHooks<T extends object> {
    onAnyTransition?: (from: string, to: string, store: Store<T>) => void;
    onEvent?: Record<string, (store: Store<T>) => void>;
    onUnhandledEvent?: (event: string, currentState: string, store: Store<T>) => void;
    onBlockedByGuard?: (from: string, to: string, store: Store<T>) => void;
    onEnterState?: (state: string, store: Store<T>) => void;
    onExitState?: (state: string, store: Store<T>) => void;
}

export declare interface IGroupOption extends Partial<ISystemOptions> {
    order?: number;
    instance?: ISystemProvider;
}

export declare interface IGroupSortedOption extends ISystemOptions {
    order: number;
    instance: ISystemProvider;
}

export declare interface IListenerConfig<T> extends Partial<IExecutable<any>> {
    group: GroupType<T>;
    order?: number;
}

export declare function Inject<T>(token: Token<T>): (target: any, propertyKey: string) => void;

export declare interface ISignal<T = any> {
    uuid: string;
    name: string | undefined;
    subscribe(callback: (data: T) => void): Disposable_2;
    once(callback: (data: T) => void): Disposable_2;
    unsubscribe(callback: (data: T) => void): void;
    dispatch(data: T): void;
}

export declare interface ISignalConfig {
    signal: ISignal<any>;
    executions: IListenerConfig<any>[];
}

/**
 * @description Manages Signal-Group bindings.
 * The SignalController handles signal subscriptions and their execution.
 * It is used for managing System Groups.
 */
export declare interface ISignalController extends ISignalInjector {
    /**
     * @description Adds a binding between a signal and a group.
     *
     * @param signal - The signal.
     * @param config - The group configuration.
     */
    inject<T>(signal: ISignal<T>, config: IListenerConfig<T>): void;
    /**
     * @description Triggers a signal with the provided data.
     *
     * @param signal - The signal.
     * @param data - The data to be passed when triggering the signal.
     */
    dispatch<T>(signal: ISignal<T>, data: T): void;
    /**
     * @description Subscribes to signals.
     */
    subscribe(): void;
    /**
     * @description Unsubscribes from signals.
     */
    unsubscribe(): void;
    /**
     * @description Clears all groups.
     */
    stop(): void;
    /**
     * @description Pauses all groups.
     */
    pause(): void;
    /**
     * @description Resumes all groups.
     */
    resume(): void;
}

export declare interface ISignalInjector {
    inject<T>(signal: ISignal<T>, config: IListenerConfig<any>): void;
}

export declare interface ISleep {
    id: string;
    wait(): Promise<void>;
    resolve(): void;
}

export declare interface IState<T extends object> {
    name: string;
    transitions: Record<string, string>;
    onEnter?: GroupType<IStateTransitionData<T>>[];
    onExit?: GroupType<IStateTransitionData<T>>[];
    onTransition?: GroupType<IStateTransitionData<T>>[];
    subMachine?: IFSM<any>;
}

export declare interface IStateTransitionData<T extends object = any> {
    from: string;
    to: string;
    store: Store<T>;
}

/**
 * Represents a set of actions performed on entities.
 * All game logic should be implemented in Systems.
 * Systems are executed based on filtering Entities by their Components.
 * Systems must be registered in a Group, which is responsible for calling them in turn
 * and can also pass additional data into the System.
 *
 * @example
 * ```ts
 * // System implements the ISystem interface.
 * export class ExampleSystem extends System {
 *
 *     // The entry point to the system.
 *     public async execute() {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              // ... logic here ...
 *         })
 *     }
 * }
 *
 * // Some systems can receive additional data in the execute method.
 * // This data is passed from the Group when the system is run.
 * // For example, you can pass an object's movement speed through the data parameter.
 * export class VelocitySystem extends System<Vec2> {
 *     // The entry point to the system.
 *     public async execute(data: Vec2) {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              const position = entity.getComponent(PositionComponent);
 *              position.x += data.x;
 *              position.y += data.y;
 *         })
 *     }
 * }
 * ```
 */
export declare interface ISystem<TData> {
    /**
     * @description Gets the identifier of the group to which this system belongs.
     */
    groupId: string;
    /**
     * @description Sets the context for the system.
     */
    setContext(groupId: string, entityStorage: IEntityStorage): void;
    /**
     * Runs the System.
     *
     * @param groupId - The identifier of the group to which this system belongs.
     * @param data - The data to be passed to the `execute` method.
     * @param externalFilter - An additional filter for the system.
     * @param withDisabled - Whether to include entities marked as disabled.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    run(data: TData, externalFilter: ComponentFilter, withDisabled: boolean): Promise<void>;
    /**
     * Filters entities by their components.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    filter(filter: ComponentFilter): Filtered;
    /**
     * The entry point for the system, where all logic is performed.
     *
     * @param data - Additional data passed from the Group.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    execute(data: TData): void | Promise<void>;
    /**
     * Gets a dependency from the ServiceContainer.
     *
     * @param token - The token of the dependency.
     * @returns The dependency.
     */
    getDependency<T>(token: Token<T>): T;
}

export declare interface ISystemExternalData {
    data: any;
}

export declare interface ISystemGroup<T = any> {
    uuid: string;
    registerGroupDependencies(): void;
    setup(data: T): IGroupOption[];
    sorted(data: T): IGroupSortedOption[];
    provide<T extends SystemType<any, any>>(system: T, data: SystemData<InstanceType<T>>): ISystemProvider;
}

export declare interface ISystemInstance extends ISystemExternalData, ISystemOptions {
    system: ISystem<any>;
    groupId: string;
}

export declare interface ISystemOptions {
    withDisabled: boolean;
    includes: ComponentType<any>[];
    excludes: ComponentType<any>[];
    repeat: number;
    canExecute: () => boolean;
}

export declare interface ISystemProvider extends ISystemExternalData {
    system: SystemType<any, any>;
}

export declare interface ISystemsContainer {
    get(ctor: SystemType<any, any>): ISystem<any>;
}

export declare interface ITimerController {
    setTimeout(callback: () => void, duration: number): string;
    setInterval(callback: () => void, duration: number): string;
    sleep(duration: number): ISleep;
    clear(uuid: string): void;
    update(deltaTime: number): void;
}

export declare interface IUpdatable {
    uuid: string;
    update(deltaTime: number): void;
}

export declare interface IUpdateLoopData {
    deltaTime: number;
    speedMultiplier: number;
    multipliedDelta: number;
}

export declare type Listener<T> = (state: T) => void;

export declare type Middleware<T> = (state: T, update: Partial<T>, next: (state: T, update: Partial<T>) => T) => T;

export declare class MyshApp {
    init(): void;
    listen(configs: ISignalConfig[]): void;
    registerGlobalServices(providers: Provider[]): void;
    protected registerServices(): void;
}

export declare const OnStateEnterSignal: Signal<IStateTransitionData<any>>;

export declare const OnStateExitSignal: Signal<IStateTransitionData<any>>;

export declare const OnStateTransitionSignal: Signal<IStateTransitionData<any>>;

export declare const OnUpdateSignal: Signal<IUpdateLoopData>;

export declare type Provider<T = any> = ClassProvider<T> | FactoryProvider<T>;

export declare class ServiceContainer {
    private static _instance;
    static get instance(): ServiceContainer;
    private providers;
    private instances;
    private systemTokens;
    private constructor();
    registerModule(moduleId: string, providers: Provider[]): void;
    registerGlobal(providers: Provider[]): void;
    get<T>(token: Token<T>, moduleId?: string): T;
    memorizeSystem(system: SystemType<any, any>, token: Token<any>, key: string): void;
    getDependencyForSystem(moduleId: string, system: ISystem<any>): void;
}

/**
 * @description A signal is a way to communicate between different parts of the application.
 *
 * @example
 * ```ts
 * import { Signal } from '@initiator/signal';
 *
 * // Create a new signal
 * const mySignal = new Signal<string>();
 *
 * // Subscribe to the signal
 * mySignal.subscribe((data) => console.log('Received data:', data));
 *
 * // Dispatch the signal with some data
 * mySignal.dispatch('Hello world!');
 * ```
 */
export declare class Signal<T> implements ISignal<T> {
    private _name;
    private listeners;
    get name(): string | undefined;
    get uuid(): string;
    private _uuid;
    constructor(_name?: string);
    /**
     * @description Subscribes to the signal.
     * @param callback - The callback function that will be called when the signal is dispatched.
     * @returns - A disposable object that can be used to unsubscribe from the signal.
     */
    subscribe(callback: (data: T) => void): Disposable_2;
    /**
     * @description Subscribes to the signal only once.
     * @param callback - The callback function that will be called when the signal is dispatched.
     * @returns - A disposable object that can be used to unsubscribe from the signal.
     */
    once(callback: (data: T) => void): Disposable_2;
    /**
     * @description Unsubscribes from the signal.
     * @param callback - The callback function that was subscribed to the signal.
     */
    unsubscribe(callback: (data: T) => void): void;
    /**
     * @description Dispatches the signal.
     * @param data - The data that will be passed to the callback functions.
     */
    dispatch(data: T): void;
}

/**
 * @description Manages Signal-Group bindings.
 * The SignalController handles signal subscriptions and their execution.
 * It is used for managing System Groups.
 */
export declare class SignalController implements ISignalController {
    private _systemStorage;
    private _entityStorage;
    private _pairs;
    private _disposables;
    private _executors;
    constructor(_systemStorage: ISystemsContainer, _entityStorage: EntityStorage);
    /**
     * @description Creates bindings between a signal and a group using a configuration.
     *
     * @param configs - Signal-Group bindings.
     * @param controller - The controller for creating group instances.
     */
    static factory(configs: ISignalConfig[], controller: ISignalController): void;
    /**
     * @description Overrides bindings between a signal and a group using a configuration.
     *
     * @param original - The original Signal-Group bindings.
     * @param overrides - The overriding Signal-Group bindings.
     * @returns The new Signal-Group bindings.
     */
    static override(original: ISignalConfig[], overrides: ISignalConfig[]): ISignalConfig[];
    /**
     * @description Adds a binding between a signal and a group.
     *
     * @param signal - The signal.
     * @param config - The group configuration.
     */
    inject<T>(signal: ISignal<T>, config: IListenerConfig<T>): void;
    /**
     * @description Triggers a signal with the provided data.
     *
     * @param signal - The signal.
     * @param data - The data to be passed when triggering the signal.
     */
    dispatch<T>(signal: ISignal<T>, data: T): void;
    /**
     * @description Subscribes to signals.
     */
    subscribe(): void;
    /**
     * @description Unsubscribes from signals.
     */
    unsubscribe(): void;
    /**
     * @description Clears all groups.
     */
    stop(): void;
    /**
     * @description Pauses all groups.
     */
    pause(): void;
    /**
     * @description Resumes all groups.
     */
    resume(): void;
}

export declare class Store<T extends object> {
    private _data;
    private listeners;
    private middleware;
    private validators;
    private history;
    private historyIndex;
    private historySize;
    constructor(_data: T, options?: StoreOptions<T>);
    /**
     * Get current state using Proxy to prevent direct mutations
     */
    get state(): T;
    /**
     * Subscribe to state changes
     * @param listener Callback function to be called when state changes
     * @returns Unsubscribe function
     */
    subscribe(listener: Listener<T>): () => void;
    /**
     * Update state using callback
     * @param callback Function that returns partial update
     * @throws Error if validation fails
     */
    setState(callback: (current: T) => Partial<T>): void;
    /**
     * Execute a transaction that can be rolled back
     * @param transaction Transaction object with apply and rollback functions
     */
    transaction(transaction: Transaction<T>): void;
    /**
     * Undo last change
     * @returns true if undo was successful
     */
    undo(): boolean;
    /**
     * Redo previously undone change
     * @returns true if redo was successful
     */
    redo(): boolean;
    /**
     * Reset store to initial state
     * @param initialData Initial data to reset to
     */
    reset(initialData?: T): void;
    private applyUpdate;
    private pushToHistory;
    private notifyListeners;
}

export declare interface StoreOptions<T> {
    middleware?: Middleware<T>[];
    validators?: Validator<T>[];
    historySize?: number;
}

/**
 * Represents a set of actions performed on entities.
 * Implements the ISystem interface.
 * All game logic should be implemented in Systems.
 * Systems are executed based on filtering Entities by their Components.
 * Systems must be registered in a Group, which is responsible for calling them in turn
 * and can also pass additional data into the System.
 *
 * @example
 * ```ts
 * export class ExampleSystem extends System {
 *
 *     // The entry point to the system.
 *     public async execute() {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              // ... logic here ...
 *         })
 *     }
 * }
 *
 * // Some systems can receive additional data in the execute method.
 * // This data is passed from the Group when the system is run.
 * // For example, you can pass an object's movement speed through the data parameter.
 * export class VelocitySystem extends System<Vec2> {
 *     // The entry point to the system.
 *     public async execute(data: Vec2) {
 *         // Filter entities by components.
 *         const entities = this.filter({
 *             includes: [PositionComponent]
 *         });
 *
 *         entities.forEach(entity => {
 *              const position = entity.getComponent(PositionComponent);
 *              position.x += data.x;
 *              position.y += data.y;
 *         })
 *     }
 * }
 * ```
 */
export declare abstract class System<TData = any> implements ISystem<TData> {
    /**
     * @description Gets the identifier of the group to which this system belongs.
     */
    get groupId(): string;
    private _groupId;
    protected withDisabled: boolean;
    protected externalFilter: ComponentFilter;
    private _entityStorage;
    setContext(groupId: string, entityStorage: IEntityStorage): void;
    /**
     * Runs the System.
     *
     * @param data - The data to be passed to the `execute` method.
     * @param externalFilter - An additional filter for the system.
     * @param withDisabled - Whether to include entities marked as disabled.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    run(data: TData, externalFilter: ComponentFilter, withDisabled: boolean): Promise<void>;
    /**
     * Filters entities by their components.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    filter(filter: ComponentFilter): Filtered;
    /**
     * Filters entities by their components without group filter mixin.
     *
     * @param filter - The filter to apply to the entities.
     * @returns Filtered object - A filtered list of entities.
     */
    cleanFilter(filter: ComponentFilter): Filtered;
    /**
     * The entry point for the system, where all logic is performed.
     *
     * @param data - Additional data passed from the Group.
     * @returns void | Promise<void> - The system can be asynchronous.
     */
    abstract execute(data: TData): void | Promise<void>;
    /**
     * Gets a dependency from the ServiceContainer.
     *
     * @param token - The token of the dependency.
     * @returns The dependency.
     */
    getDependency<T>(token: Token<T>): T;
}

export declare type SystemData<T extends ISystem<any>> = T extends ISystem<infer U> ? U : never;

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
export declare abstract class SystemGroup<T = any> implements ISystemGroup<T> {
    get uuid(): string;
    private _uuid;
    /**
     * @description The method should return an array of objects containing data for creating Systems.
     * @param data - Data received from the Signal that may be used in Systems.
     */
    abstract setup(data: T): IGroupOption[];
    sorted(data: T): IGroupSortedOption[];
    registerGroupDependencies(): void;
    provide<T extends SystemType<any, any>>(system: T, data: SystemData<InstanceType<T>>): ISystemProvider;
    protected setupDependencies(): Provider[];
}

export declare class SystemsContainer implements ISystemsContainer {
    private _cache;
    get(ctor: SystemType<any, any>): ISystem<any>;
}

export declare type SystemType<TClass extends ISystem<TData>, TData> = new (...args: any[]) => TClass;

/**
 * @description A controller for managing timers and intervals.
 * Unlike the standard setTimeout and setInterval, the timers created depend on the game's FPS.
 * That is, if the game runs at 60 FPS, the timer will trigger once per second.
 *
 * @example
 * ```ts
 * import { TimerController } from '@shared/timer';
 *
 * const timerController = new TimerController();
 *
 * // Create a timer
 * const timerId = timerController.setTimeout(() => console.log('Timer complete'), 1000);
 *
 * // Remove the timer by its ID
 * timerController.clear(timerId);
 *
 * // Create an interval
 * const intervalId = timerController.setInterval(() => console.log('Interval tick'), 500);
 *
 * // Remove the interval by its ID
 * timerController.clear(intervalId);
 *
 * // Stop all timers and intervals
 * timerController.stop();
 * ```
 */
export declare class TimerController implements ITimerController {
    private _updatables;
    /**
     * @description Creates a new timer.
     * @param callback - The function that will be called when the timer completes.
     * @param duration - The duration of the timer in milliseconds.
     * @returns The ID of the created timer.
     */
    setTimeout(callback: () => void, duration: number): string;
    /**
     * @description Creates a new interval.
     * @param callback - The function that will be called on each tick of the interval.
     * @param duration - The duration of each interval tick in milliseconds.
     * @returns The ID of the created interval.
     */
    setInterval(callback: () => void, duration: number): string;
    /**
     * @description Creates a new code execution delay.
     * @param duration - The delay duration in milliseconds.
     * @returns An object with the methods `wait` and `resolve`. The `wait` method returns a promise that resolves after the specified duration.
     * The `resolve` method immediately resolves the promise and removes the timer from the controller.
     */
    sleep(duration: number): ISleep;
    /**
     * @description Stops the timer or interval by its ID.
     * @param uuid - The ID of the timer or interval.
     */
    clear(uuid: string): void;
    /**
     * @description Updates all timers and intervals.
     * @param deltaTime - The time between frames in milliseconds.
     */
    update(deltaTime: number): void;
}

export declare type Token<T = any> = Constructor<T> | symbol;

export declare interface Transaction<T> {
    apply: (state: T) => T;
    rollback: (state: T) => T;
}

export declare class UpdateLoop {
    private _lastTime;
    private _paused;
    private _speedMultiplier;
    private _onUpdate;
    init(): void;
    addUpdateCallback(callback: (deltaTime: number) => void): void;
    removeUpdateCallback(callback: (deltaTime: number) => void): void;
    /**
     * Pauses the application.
     */
    pause(paused: boolean): void;
    /**
     * Sets the speed multiplier for the application.
     */
    setSpeedMultiplier(speedMultiplier: number): void;
    private animate;
    private update;
}

export declare class Utils {
    static uuid(): string;
    static debounce(callback: Callback, delay?: number): Callback;
}

export declare type Validator<T> = (update: Partial<T>) => boolean | string;

export { }
