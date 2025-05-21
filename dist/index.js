class x {
  constructor() {
    this._groupId = "", this.withDisabled = !1;
  }
  /**
   * @description Gets the identifier of the group to which this system belongs.
   */
  get groupId() {
    return this._groupId;
  }
  setContext(e, t) {
    this._groupId = e, this._entityStorage = t;
  }
  /**
   * Runs the System.
   *
   * @param data - The data to be passed to the `execute` method.
   * @param externalFilter - An additional filter for the system.
   * @param withDisabled - Whether to include entities marked as disabled.
   * @returns void | Promise<void> - The system can be asynchronous.
   */
  async run(e, t, s) {
    this.externalFilter = t, this.withDisabled = s, await this.execute(e);
  }
  /**
   * Filters entities by their components.
   *
   * @param filter - The filter to apply to the entities.
   * @returns Filtered object - A filtered list of entities.
   */
  filter(e) {
    const t = {
      includes: [...e.includes, ...this.externalFilter.includes || []],
      excludes: [...e.excludes || [], ...this.externalFilter.excludes || []]
    };
    return this._entityStorage.filter(t, this.withDisabled);
  }
  /**
   * Filters entities by their components without group filter mixin.
   *
   * @param filter - The filter to apply to the entities.
   * @returns Filtered object - A filtered list of entities.
   */
  cleanFilter(e) {
    return this._entityStorage.filter(e, this.withDisabled);
  }
  /**
   * Gets a dependency from the ServiceContainer.
   *
   * @param token - The token of the dependency.
   * @returns The dependency.
   */
  getDependency(e) {
    return h.instance.get(e, this.groupId);
  }
}
class p {
  static uuid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  static debounce(e, t = 0) {
    let s = null;
    return (...i) => {
      clearTimeout(s), s = setTimeout(() => {
        e(...i);
      }, t);
    };
  }
}
class v {
  constructor() {
    this._uuid = p.uuid();
  }
  get uuid() {
    return this._uuid;
  }
  sorted(e) {
    const t = this.setup(e), s = 1e4;
    return t.forEach((i, n) => {
      i.withDisabled === void 0 && (i.withDisabled = !1), i.includes === void 0 && (i.includes = []), i.excludes === void 0 && (i.excludes = []), i.repeat || (i.repeat = 1), i.canExecute || (i.canExecute = () => !0), i.order === void 0 && (i.order = (n + 1) * s);
    }), t.sort((i, n) => (i.order || 0) - (n.order || 0));
  }
  registerGroupDependencies() {
    const e = this.setupDependencies();
    h.instance.registerModule(this.uuid, e);
  }
  provide(e, t) {
    return {
      system: e,
      data: t
    };
  }
  setupDependencies() {
    return [];
  }
}
class h {
  constructor() {
    this.providers = /* @__PURE__ */ new Map(), this.instances = /* @__PURE__ */ new Map(), this.systemTokens = [], this.providers.set("global", /* @__PURE__ */ new Map()), this.instances.set("global", /* @__PURE__ */ new Map());
  }
  static get instance() {
    return h._instance || (h._instance = new h()), h._instance;
  }
  registerModule(e, t) {
    this.providers.has(e) || (this.providers.set(e, /* @__PURE__ */ new Map()), this.instances.set(e, /* @__PURE__ */ new Map()));
    const s = this.providers.get(e);
    for (const i of t)
      s.set(i.provide, i);
  }
  registerGlobal(e) {
    this.registerModule("global", e);
  }
  get(e, t = "global") {
    var r;
    let s = ((r = this.providers.get(t)) == null ? void 0 : r.get(e)) ?? this.providers.get("global").get(e);
    if (!s)
      throw new Error(`Provider for token ${e.toString()} not found`);
    const i = this.instances.get(t === "global" ? "global" : t);
    if (i.has(e))
      return i.get(e);
    const n = "useClass" in s ? new s.useClass() : s.useFactory();
    return i.set(e, n), n;
  }
  memorizeSystem(e, t, s) {
    this.systemTokens.push({ system: e, token: t, key: s });
  }
  getDependencyForSystem(e, t) {
    if (!("injectHere" in t)) return;
    const s = [];
    for (const i of this.systemTokens)
      t instanceof i.system && s.push({
        token: i.token,
        key: i.key
      });
    s.forEach((i) => {
      var n;
      if (i.key in t) {
        const r = ((n = this.providers.get(e)) == null ? void 0 : n.get(i.token)) ?? this.providers.get("global").get(i.token);
        if (!r) return;
        let o = this.get(i.token, e);
        r.immutable && (o = new Proxy(o, {
          get: (u, l) => {
            const m = u[l];
            return m instanceof Object ? new Proxy(m, {}) : m;
          },
          set: () => (console.warn("Direct state mutation is not allowed. Use setState instead."), !1)
        })), Object.defineProperty(t, i.key, {
          value: o,
          enumerable: !0,
          configurable: !1
        });
      }
    });
  }
}
function D(a) {
  if (!a)
    throw new Error("Token must be provided to @Inject decorator when not using reflect-metadata");
  return function(e, t) {
    let s = "global";
    if (e instanceof x) {
      Object.defineProperty(e, "injectHere", {
        value: "injectHere",
        enumerable: !1,
        configurable: !1
      }), Object.defineProperty(e, t, {
        value: null
      }), h.instance.memorizeSystem(e.constructor, a, t);
      return;
    }
    e instanceof v && (s = e.uuid), Object.defineProperty(e, t, {
      get: () => h.instance.get(a, s),
      enumerable: !0,
      configurable: !1
    });
  };
}
class y {
  constructor() {
    this._cache = /* @__PURE__ */ new Map();
  }
  get(e) {
    let t = this._cache.get(e);
    return t || (t = new e(), this._cache.set(e, t)), t;
  }
}
const C = (a, e) => (t) => !(!t.hasComponents(a) || e && t.hasComponents(e));
class E {
  constructor(e = []) {
    this._entities = e;
  }
  /**
   * @description
   * Returns the total number of entities in the collection.
   */
  get count() {
    return this._entities.length;
  }
  /**
   * @description
   * Returns an array containing all the entities in the collection.
   */
  get items() {
    return this._entities;
  }
  /**
   * @description
   * Iterates through each entity and calls the provided callback function for each entity.
   *
   * @param callback - The callback function to be called for each entity.
   */
  forEach(e) {
    for (let t = 0; t < this._entities.length; t++)
      e(this._entities[t], t);
  }
  /**
   * @description
   * Iterates through each entity asynchronously and calls the provided callback function for each entity.
   *
   * @param callback - The callback function to be called for each entity.
   * @returns A promise that resolves when all iterations are completed.
   */
  async sequential(e) {
    let t = 0;
    for (const s of this._entities)
      await e(s, t), t += 1;
  }
  /**
   * @description
   * Iterates through each entity asynchronously and calls the provided callback function for each entity in parallel.
   *
   * @param callback - The callback function to be called for each entity.
   * @returns A promise that resolves when all iterations are completed.
   */
  async parallel(e) {
    const t = this._entities.map(e);
    await Promise.all(t);
  }
}
const g = class g {
  /**
   * @description
   * Increment the frequency of a given component type.
   *
   * @param component The component to increment the frequency for.
   */
  static increment(e) {
    const t = this._componentFrequency.get(e) ?? 0;
    this._componentFrequency.set(e, t + 1);
  }
  /**
   * @description
   * Decrement the frequency of a given component type. If it reaches zero,
   * remove it from the map.
   *
   * @param component The component to decrement the frequency for.
   */
  static decrement(e) {
    const t = this._componentFrequency.get(e) ?? 0;
    t > 1 ? this._componentFrequency.set(e, t - 1) : this._componentFrequency.delete(e);
  }
  /**
   * @description
   * Get the rarity of a given component type.
   *
   * @param component The component to get the rarity for.
   */
  static rarity(e) {
    return this._componentFrequency.get(e) ?? 0;
  }
  /**
   * @description
   * Sort an array of component types by their rarity.
   *
   * @param components An array of component types to sort.
   * @returns The sorted array of component types.
   */
  static sortByRarity(e) {
    return [...e].sort((t, s) => this.rarity(t) - this.rarity(s));
  }
};
g._componentFrequency = /* @__PURE__ */ new Map();
let c = g;
class b {
  constructor() {
    this._entities = /* @__PURE__ */ new Map();
  }
  addEntity(e) {
    const { uuid: t, name: s } = e;
    if (this._entities.has(t))
      throw new Error(`Entity with UUID [${s}-${t}] already exists in the storage.`);
    this._entities.set(t, e);
  }
  removeEntity(e) {
    const t = this._entities.get(e);
    if (t)
      return this._entities.delete(e), t;
  }
  getEntity(e) {
    return this._entities.get(e);
  }
  getAllEntities() {
    return Array.from(this._entities.values());
  }
  getActiveEntities() {
    return Array.from(this._entities.values()).filter((e) => e.active);
  }
  getInactiveEntities() {
    return Array.from(this._entities.values()).filter((e) => !e.active);
  }
  filter(e, t) {
    let s = t ? this.getAllEntities() : this.getActiveEntities();
    if (e.excludes || (e.excludes = []), e != null && e.includes.length || e != null && e.excludes.length) {
      const i = c.sortByRarity(e.includes), n = e.excludes.length ? c.sortByRarity(e.excludes) : void 0, r = C(i, n);
      s = s.filter(r);
    }
    return new E(s);
  }
}
class S {
  constructor(e, t) {
    this._systemsContainer = e, this._entityStorage = t, this._isPaused = !1, this._resumePromise = null, this._resolveResume = null, this._queue = [], this._groups = [];
  }
  get groups() {
    return this._groups;
  }
  async execute(e, t) {
    var s;
    for (this._queue = this.setExecutionQueue(e, t); this._queue.length > 0; ) {
      this._isPaused && await this.waitForResume();
      const i = this._queue.shift();
      if (i) {
        const n = i.canExecute();
        if (((s = this._currentGroup) == null ? void 0 : s.uuid) !== i.groupId && (this._currentGroup = this._groups.find((r) => r.uuid === i.groupId)), n) {
          const r = { includes: i.includes, excludes: i.excludes };
          i.system.setContext(i.groupId, this._entityStorage), h.instance.getDependencyForSystem(i.groupId, i.system), await i.system.run(i.data, r, i.withDisabled);
        }
      }
    }
  }
  /**
   * @description Stops all groups.
   */
  stop() {
    this._queue = [];
  }
  /**
   * @description Pauses all groups.
   */
  pause() {
    this._isPaused || (this._isPaused = !0);
  }
  /**
   * @description Resumes all groups.
   */
  resume() {
    this._isPaused && (this._isPaused = !1, this._resolveResume && (this._resolveResume(), this._resolveResume = null, this._resumePromise = null));
  }
  waitForResume() {
    return this._resumePromise || (this._resumePromise = new Promise((e) => {
      this._resolveResume = e;
    })), this._resumePromise;
  }
  setExecutionQueue(e, t) {
    const s = [];
    return t.forEach((i) => {
      if (i.canExecute(e)) {
        const n = i.group.sorted(e), r = i.group.uuid;
        this._groups.push(i.group), n.forEach((o) => {
          const u = this._systemsContainer.get(o.instance.system);
          for (let l = 0; l < o.repeat; l++)
            s.push({
              ...o,
              data: o.instance.data,
              groupId: r,
              system: u
            });
        });
      }
    }), s;
  }
}
class d {
  constructor(e, t) {
    this._systemStorage = e, this._entityStorage = t, this._pairs = /* @__PURE__ */ new Map(), this._disposables = [], this._executors = [];
  }
  /**
   * @description Creates bindings between a signal and a group using a configuration.
   *
   * @param configs - Signal-Group bindings.
   * @param controller - The controller for creating group instances.
   */
  static factory(e, t) {
    e.forEach((s) => {
      s.executions.forEach((i) => {
        t.inject(s.signal, i);
      });
    });
  }
  /**
   * @description Overrides bindings between a signal and a group using a configuration.
   *
   * @param original - The original Signal-Group bindings.
   * @param overrides - The overriding Signal-Group bindings.
   * @returns The new Signal-Group bindings.
   */
  static override(e, t) {
    const s = /* @__PURE__ */ new Map();
    for (const i of e)
      s.set(i.signal, { ...i, executions: [...i.executions] });
    for (const i of t)
      if (s.has(i.signal)) {
        const n = s.get(i.signal), r = /* @__PURE__ */ new Map();
        for (const o of n.executions)
          r.set(o.order ?? r.size + 1, { ...o });
        for (const o of i.executions)
          o.order !== void 0 && r.has(o.order) ? r.set(o.order, { ...o }) : r.set(o.order ?? r.size + 1, {
            ...o
          });
        n.executions = Array.from(r.values()).sort(
          (o, u) => o.order - u.order
        );
      } else
        s.set(i.signal, { ...i });
    return Array.from(s.values());
  }
  /**
   * @description Adds a binding between a signal and a group.
   *
   * @param signal - The signal.
   * @param config - The group configuration.
   */
  inject(e, t) {
    const s = this._pairs.get(e) || [], i = new t.group();
    i.registerGroupDependencies();
    const n = t.canExecute ? t.canExecute : (u) => !0, r = {
      group: i,
      canExecute: n,
      order: t.order ? t.order : 0
    };
    s.push(r), s.forEach((u, l) => {
      u.order || (u.order = (l + 1) * 1e4);
    });
    const o = s.sort((u, l) => (u.order || 0) - (l.order || 0));
    this._pairs.set(e, o);
  }
  /**
   * @description Triggers a signal with the provided data.
   *
   * @param signal - The signal.
   * @param data - The data to be passed when triggering the signal.
   */
  dispatch(e, t) {
    e.dispatch(t);
  }
  /**
   * @description Subscribes to signals.
   */
  subscribe() {
    Array.from(this._pairs.keys()).forEach((t) => {
      const s = t.subscribe(async (i) => {
        const n = this._pairs.get(t) || [], r = new S(this._systemStorage, this._entityStorage);
        this._executors.push(r), await r.execute(i, n);
        const o = this._executors.indexOf(r);
        this._executors.splice(o, 1);
      });
      this._disposables.push(s);
    });
  }
  /**
   * @description Unsubscribes from signals.
   */
  unsubscribe() {
    this._disposables.forEach((e) => e.dispose()), this._pairs.clear(), this.stop(), this._executors.length = 0;
  }
  /**
   * @description Clears all groups.
   */
  stop() {
    this._executors.forEach((e) => e.stop());
  }
  /**
   * @description Pauses all groups.
   */
  pause() {
    this._executors.forEach((e) => e.pause());
  }
  /**
   * @description Resumes all groups.
   */
  resume() {
    this._executors.forEach((e) => e.resume());
  }
}
class P {
  constructor(e, t, s, i) {
    this._uuid = e, this._timerController = t, this._onComplete = s, this._duration = i, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  update(e) {
    this._elapsedTime += e * 1e3, this._elapsedTime >= this._duration && (this._onComplete(), this._timerController.clear(this.uuid));
  }
}
class F {
  constructor(e, t, s) {
    this._uuid = e, this._onComplete = t, this._duration = s, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  onComplete() {
    return this._onComplete;
  }
  update(e) {
    this._elapsedTime += e * 1e3, this._elapsedTime >= this._duration && (this._elapsedTime = 0, this._onComplete());
  }
}
class M {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
  /*
   * @description - Resolves all promises in an array with the same data.
   */
  static resolveAll(e, t) {
    e.forEach((s) => s.resolve(t));
  }
  /*
   * @description - Rejects all promises in an array with the same reason.
   */
  static rejectAll(e, t) {
    e.forEach((s) => s.reject(t));
  }
  /*
   * @description - Returns a promise that resolves when all promises in the array are resolved.
   */
  static all(e) {
    return Promise.all(e.map((t) => t.promise));
  }
  /*
   * @description - Returns a promise that resolves when all promises in the array are settled.
   */
  static allSettled(e) {
    return Promise.allSettled(e.map((t) => t.promise));
  }
  /*
   * @description - Returns a promise that resolves when any promise in the array is resolved.
   */
  static race(e) {
    return Promise.race(e.map((t) => t.promise));
  }
}
class _ {
  constructor() {
    this._updatables = /* @__PURE__ */ new Map();
  }
  /**
   * @description Creates a new timer.
   * @param callback - The function that will be called when the timer completes.
   * @param duration - The duration of the timer in milliseconds.
   * @returns The ID of the created timer.
   */
  setTimeout(e, t) {
    const s = p.uuid(), i = new P(s, this, e, t);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description Creates a new interval.
   * @param callback - The function that will be called on each tick of the interval.
   * @param duration - The duration of each interval tick in milliseconds.
   * @returns The ID of the created interval.
   */
  setInterval(e, t) {
    const s = p.uuid(), i = new F(s, e, t);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description Creates a new code execution delay.
   * @param duration - The delay duration in milliseconds.
   * @returns An object with the methods `wait` and `resolve`. The `wait` method returns a promise that resolves after the specified duration.
   * The `resolve` method immediately resolves the promise and removes the timer from the controller.
   */
  sleep(e) {
    const t = new M(), s = this.setTimeout(() => t.resolve(), e);
    return {
      id: s,
      wait: async () => await t.promise,
      resolve: () => {
        t.resolve(), this.clear(s);
      }
    };
  }
  /**
   * @description Stops the timer or interval by its ID.
   * @param uuid - The ID of the timer or interval.
   */
  clear(e) {
    this._updatables.has(e) && this._updatables.delete(e);
  }
  /**
   * @description Updates all timers and intervals.
   * @param deltaTime - The time between frames in milliseconds.
   */
  update(e) {
    Array.from(this._updatables.values()).forEach((s) => s.update(e));
  }
}
class T {
  constructor(e = "Signal") {
    this._name = e, this.listeners = [], this._uuid = p.uuid();
  }
  get name() {
    return this._name;
  }
  get uuid() {
    return this._uuid;
  }
  /**
   * @description Subscribes to the signal.
   * @param callback - The callback function that will be called when the signal is dispatched.
   * @returns - A disposable object that can be used to unsubscribe from the signal.
   */
  subscribe(e) {
    return this.listeners.push({ callback: e, once: !1 }), {
      dispose: () => {
        this.unsubscribe(e);
      }
    };
  }
  /**
   * @description Subscribes to the signal only once.
   * @param callback - The callback function that will be called when the signal is dispatched.
   * @returns - A disposable object that can be used to unsubscribe from the signal.
   */
  once(e) {
    return this.listeners.push({ callback: e, once: !0 }), {
      dispose: () => {
        this.unsubscribe(e);
      }
    };
  }
  /**
   * @description Unsubscribes from the signal.
   * @param callback - The callback function that was subscribed to the signal.
   */
  unsubscribe(e) {
    this.listeners = this.listeners.filter((t) => t.callback !== e);
  }
  /**
   * @description Dispatches the signal.
   * @param data - The data that will be passed to the callback functions.
   */
  dispatch(e) {
    const t = [];
    for (const s of this.listeners)
      s.callback(e), s.once && t.push(s.callback);
    t.length > 0 && (this.listeners = this.listeners.filter((s) => !t.includes(s.callback)));
  }
}
const I = new T();
class f {
  constructor() {
    this._lastTime = 0, this._paused = !1, this._speedMultiplier = 1, this._onUpdate = [], this.animate = (e) => {
      if (!this._paused) {
        if (this._lastTime !== 0) {
          const t = (e - this._lastTime) / 1e3;
          this.update(t);
        }
        this._lastTime = e, requestAnimationFrame(this.animate);
      }
    };
  }
  init() {
    requestAnimationFrame(this.animate);
  }
  addUpdateCallback(e) {
    this._onUpdate.push(e);
  }
  removeUpdateCallback(e) {
    this._onUpdate = this._onUpdate.filter((t) => t !== e);
  }
  /**
   * Pauses the application.
   */
  pause(e) {
    this._paused = e;
  }
  /**
   * Sets the speed multiplier for the application.
   */
  setSpeedMultiplier(e) {
    this._speedMultiplier = e;
  }
  update(e) {
    if (this._paused) return;
    const t = e * this._speedMultiplier;
    this._onUpdate.forEach((s) => s(t)), I.dispatch({
      deltaTime: e,
      speedMultiplier: this._speedMultiplier,
      multipliedDelta: t
    });
  }
}
class A {
  init() {
    this.registerServices();
    const e = h.instance.get(f), t = h.instance.get(_);
    e.addUpdateCallback((s) => {
      t.update(s);
    }), e.init();
  }
  listen(e) {
    const t = h.instance.get(d);
    d.factory(e, t), t.subscribe();
  }
  registerGlobalServices(e) {
    h.instance.registerGlobal(e);
  }
  registerServices() {
    const e = new b(), t = new y(), s = new f(), i = new _(), n = new d(t, e);
    this.registerGlobalServices([
      { provide: b, useFactory: () => e },
      { provide: y, useFactory: () => t },
      { provide: f, useFactory: () => s },
      { provide: _, useFactory: () => i },
      { provide: d, useFactory: () => n }
    ]);
  }
}
class w {
  constructor() {
    this._items = [];
  }
  get items() {
    return this._items;
  }
  set(e) {
    this._items.push(e);
  }
  get(e) {
    return this._items.find((t) => t instanceof e);
  }
  has(e) {
    return !!this.get(e);
  }
  delete(e) {
    const t = this.get(e);
    return t && (this._items = this.items.filter((s) => s.constructor !== e)), !!t;
  }
  clear() {
    this._items.length = 0;
  }
}
class U {
  constructor(e, t = "Entity") {
    this._uuid = e, this._name = t, this._active = !0, this._components = new w(), this._disabledComponents = new w();
  }
  /**
   * @description
   * The unique identifier of the entity.
   */
  get uuid() {
    return this._uuid;
  }
  /**
   * @description
   * The name of the entity.
   */
  get name() {
    return this._name;
  }
  set name(e) {
    this._name = e;
  }
  /**
   * @description
   * Whether the entity is currently active.
   */
  get active() {
    return this._active;
  }
  set active(e) {
    this._active = e;
  }
  /**
   * @description
   * A list of all components attached to the entity.
   */
  get components() {
    return this._components.items;
  }
  /**
   * @description
   * A list of all disabled components attached to the entity.
   */
  get disabledComponents() {
    return this._disabledComponents.items;
  }
  /**
   * @description
   * Adds a component to the entity.
   *
   * @param component The component instance to be added.
   * @param enabled Whether the component should be initially enabled or disabled. Defaults to true.
   */
  addComponent(e, t = !0) {
    const s = this.extractConstructor(e);
    if (this._components.has(s) || this._disabledComponents.has(s))
      throw new Error(
        `Component of type ${s.name} already exists in entity [${this._name}-${this._uuid}]`
      );
    t ? (this._components.set(e), c.increment(s)) : (this._disabledComponents.set(e), c.decrement(s));
  }
  /**
   * @description Gets a component by its constructor function.
   * @param ctor The constructor function of the component.
   * @returns The component instance, or null if no such component was found.
   */
  getComponent(e) {
    const t = this._components.get(e);
    if (!t)
      throw new Error(
        `Component of type ${e.name} is not found in [${this.name}-${this.uuid}].`
      );
    return t;
  }
  /**
   * @description Checks whether the entity has at least one of the specified components.
   * @param types An array of component constructors.
   * @returns True if the entity has at least one of the specified components, false otherwise.
   */
  hasComponents(e) {
    return e.every((t) => !!this._components.get(t));
  }
  /**
   * @description Removes a component from the entity.
   * @param ctor The constructor function of the component to be removed.
   * @returns The removed component instance.
   */
  removeComponent(e) {
    let t;
    if (this._components.has(e) ? (t = this._components.get(e), this._components.delete(e)) : this._disabledComponents.has(e) && (t = this._disabledComponents.get(e), this._disabledComponents.delete(e)), !t)
      throw new Error(
        `Component type ${e.name} does not exist in entity [${this._name}-${this._uuid}]`
      );
    return c.decrement(e), t;
  }
  /**
   * @description
   * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
   *
   * @param ctor The constructor function of the component to be enabled.
   */
  enableComponent(e) {
    if (!this._disabledComponents.has(e))
      throw new Error(
        `Cannot enable component of type ${e.name} - it does not exist or is already enabled.`
      );
    const t = this._disabledComponents.get(e);
    this._disabledComponents.delete(e), this._components.set(t), c.increment(e);
  }
  /**
   * @description
   * Disables a component. If the component doesn't exist or is already disabled, throws an error.
   *
   * @param ctor The constructor function of the component to be disabled.
   */
  disableComponent(e) {
    if (!this._components.has(e))
      throw new Error(
        `Cannot disable component of type ${e.name} - it does not exist or is already disabled.`
      );
    const t = this._components.get(e);
    this._components.delete(e), this._disabledComponents.set(t), c.decrement(e);
  }
  /**
   * @description Disables all components on the entity.
   */
  disableAllComponents() {
    for (const e of this._components.items)
      this._disabledComponents.set(e), c.decrement(e.constructor);
    this._components.clear();
  }
  /**
   * @description Enables all components that were previously disabled.
   */
  enableAllComponents() {
    for (const e of this._disabledComponents.items)
      this._components.set(e), c.increment(e.constructor);
    this._disabledComponents.clear();
  }
  /**
   * Checks whether the entity meets the specified filtering criteria.
   * @param filter - The filter criteria.
   * @returns True if the entity satisfies the filter, false otherwise.
   */
  isSatisfiedFilter(e) {
    const t = e.includes || [], s = e.excludes || [];
    return this.hasComponents(t) && (!s.length || !this.hasComponents(s));
  }
  extractConstructor(e) {
    return e.constructor;
  }
}
class j {
  constructor(e, t = {}) {
    this._data = e, this.listeners = /* @__PURE__ */ new Set(), this.middleware = [], this.validators = [], this.history = [], this.historyIndex = -1, this.middleware = t.middleware || [], this.validators = t.validators || [], this.historySize = t.historySize || 10, this.pushToHistory(this._data);
  }
  /**
   * Get current state using Proxy to prevent direct mutations
   */
  get state() {
    return new Proxy(this._data, {
      get: (e, t) => {
        const s = e[t];
        return s instanceof Object ? new Proxy(s, {}) : s;
      },
      set: () => (console.warn("Direct state mutation is not allowed. Use setState instead."), !1)
    });
  }
  /**
   * Subscribe to state changes
   * @param listener Callback function to be called when state changes
   * @returns Unsubscribe function
   */
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  /**
   * Update state using callback
   * @param callback Function that returns partial update
   * @throws Error if validation fails
   */
  setState(e) {
    const t = e(this.state);
    for (const i of this.validators) {
      const n = i(t);
      if (n !== !0)
        throw new Error(typeof n == "string" ? n : "Validation failed");
    }
    let s = this.middleware.length ? this._data : { ...this._data, ...t };
    for (const i of this.middleware)
      s = i(s, t, this.applyUpdate);
    this._data = s, this.pushToHistory(s), this.notifyListeners();
  }
  /**
   * Execute a transaction that can be rolled back
   * @param transaction Transaction object with apply and rollback functions
   */
  transaction(e) {
    const t = this.state;
    try {
      this._data = e.apply(this.state), this.pushToHistory(this._data), this.notifyListeners();
    } catch (s) {
      throw this._data = e.rollback(t), this.notifyListeners(), s;
    }
  }
  /**
   * Undo last change
   * @returns true if undo was successful
   */
  undo() {
    return this.historyIndex > 0 ? (this.historyIndex--, this._data = this.history[this.historyIndex], this.notifyListeners(), !0) : !1;
  }
  /**
   * Redo previously undone change
   * @returns true if redo was successful
   */
  redo() {
    return this.historyIndex < this.history.length - 1 ? (this.historyIndex++, this._data = this.history[this.historyIndex], this.notifyListeners(), !0) : !1;
  }
  /**
   * Reset store to initial state
   * @param initialData Initial data to reset to
   */
  reset(e = {}) {
    this._data = e, this.history = [], this.historyIndex = -1, this.pushToHistory(this._data), this.notifyListeners();
  }
  applyUpdate(e, t) {
    return { ...e, ...t };
  }
  pushToHistory(e) {
    this.historyIndex++, this.history = this.history.slice(0, this.historyIndex).concat([{ ...e }]), this.history.length > this.historySize && (this.history = this.history.slice(-this.historySize), this.historyIndex = this.history.length - 1);
  }
  notifyListeners() {
    this.listeners.forEach((e) => e(this.state));
  }
}
export {
  c as ComponentsRaritySorter,
  M as DeferredPromise,
  U as Entity,
  b as EntityStorage,
  S as Executor,
  D as Inject,
  A as MyshApp,
  I as OnUpdateSignal,
  h as ServiceContainer,
  T as Signal,
  d as SignalController,
  j as Store,
  x as System,
  v as SystemGroup,
  y as SystemsContainer,
  _ as TimerController,
  f as UpdateLoop,
  p as Utils
};
