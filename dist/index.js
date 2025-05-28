class C {
  constructor() {
    this._groupId = "", this.withDisabled = !1;
  }
  /**
   * @description Gets the identifier of the group to which this system belongs.
   */
  get groupId() {
    return this._groupId;
  }
  setContext(t, e) {
    this._groupId = t, this._entityStorage = e;
  }
  /**
   * Runs the System.
   *
   * @param data - The data to be passed to the `execute` method.
   * @param externalFilter - An additional filter for the system.
   * @param withDisabled - Whether to include entities marked as disabled.
   * @returns void | Promise<void> - The system can be asynchronous.
   */
  async run(t, e, s) {
    this.externalFilter = e, this.withDisabled = s, await this.execute(t);
  }
  /**
   * Filters entities by their components.
   *
   * @param filter - The filter to apply to the entities.
   * @returns Filtered object - A filtered list of entities.
   */
  filter(t) {
    const e = {
      includes: [...t.includes, ...this.externalFilter.includes || []],
      excludes: [...t.excludes || [], ...this.externalFilter.excludes || []]
    };
    return this._entityStorage.filter(e, this.withDisabled);
  }
  /**
   * Filters entities by their components without group filter mixin.
   *
   * @param filter - The filter to apply to the entities.
   * @returns Filtered object - A filtered list of entities.
   */
  cleanFilter(t) {
    return this._entityStorage.filter(t, this.withDisabled);
  }
  /**
   * Gets a dependency from the ServiceContainer.
   *
   * @param token - The token of the dependency.
   * @returns The dependency.
   */
  getDependency(t) {
    return u.instance.get(t, this.groupId);
  }
}
class _ {
  static uuid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  static debounce(t, e = 0) {
    let s = null;
    return (...i) => {
      clearTimeout(s), s = setTimeout(() => {
        t(...i);
      }, e);
    };
  }
}
class T {
  constructor() {
    this._uuid = _.uuid();
  }
  get uuid() {
    return this._uuid;
  }
  sorted(t) {
    const e = this.setup(t), s = 1e4;
    return e.forEach((i, r) => {
      i.withDisabled === void 0 && (i.withDisabled = !1), i.includes === void 0 && (i.includes = []), i.excludes === void 0 && (i.excludes = []), i.repeat || (i.repeat = 1), i.canExecute || (i.canExecute = () => !0), i.order === void 0 && (i.order = (r + 1) * s);
    }), e.sort((i, r) => (i.order || 0) - (r.order || 0));
  }
  registerGroupDependencies() {
    const t = this.setupDependencies();
    u.instance.registerModule(this.uuid, t);
  }
  provide(t, e) {
    return {
      system: t,
      data: e
    };
  }
  setupDependencies() {
    return [];
  }
}
class u {
  constructor() {
    this.providers = /* @__PURE__ */ new Map(), this.instances = /* @__PURE__ */ new Map(), this.systemTokens = [], this.providers.set("global", /* @__PURE__ */ new Map()), this.instances.set("global", /* @__PURE__ */ new Map());
  }
  static get instance() {
    return u._instance || (u._instance = new u()), u._instance;
  }
  registerModule(t, e) {
    this.providers.has(t) || (this.providers.set(t, /* @__PURE__ */ new Map()), this.instances.set(t, /* @__PURE__ */ new Map()));
    const s = this.providers.get(t);
    for (const i of e)
      s.set(i.provide, i);
  }
  registerGlobal(t) {
    this.registerModule("global", t);
  }
  get(t, e = "global") {
    var n;
    let s = ((n = this.providers.get(e)) == null ? void 0 : n.get(t)) ?? this.providers.get("global").get(t);
    if (!s)
      throw new Error(`Provider for token ${t.toString()} not found`);
    const i = this.instances.get(e === "global" ? "global" : e);
    if (i.has(t))
      return i.get(t);
    const r = "useClass" in s ? new s.useClass() : s.useFactory();
    return i.set(t, r), r;
  }
  memorizeSystem(t, e, s) {
    this.systemTokens.push({ system: t, token: e, key: s });
  }
  getDependencyForSystem(t, e) {
    if (!("injectHere" in e)) return;
    const s = [];
    for (const i of this.systemTokens)
      e instanceof i.system && s.push({
        token: i.token,
        key: i.key
      });
    s.forEach((i) => {
      var r;
      if (i.key in e) {
        const n = ((r = this.providers.get(t)) == null ? void 0 : r.get(i.token)) ?? this.providers.get("global").get(i.token);
        if (!n) return;
        let o = this.get(i.token, t);
        n.immutable && (o = new Proxy(o, {
          get: (h, c) => {
            const d = h[c];
            return d instanceof Object ? new Proxy(d, {}) : d;
          },
          set: () => (console.warn("Direct state mutation is not allowed. Use setState instead."), !1)
        })), Object.defineProperty(e, i.key, {
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
  return function(t, e) {
    let s = "global";
    if (t instanceof C) {
      Object.defineProperty(t, "injectHere", {
        value: "injectHere",
        enumerable: !1,
        configurable: !1
      }), Object.defineProperty(t, e, {
        value: null
      }), u.instance.memorizeSystem(t.constructor, a, e);
      return;
    }
    t instanceof T && (s = t.uuid), Object.defineProperty(t, e, {
      get: () => u.instance.get(a, s),
      enumerable: !0,
      configurable: !1
    });
  };
}
class w {
  constructor() {
    this._cache = /* @__PURE__ */ new Map();
  }
  get(t) {
    let e = this._cache.get(t);
    return e || (e = new t(), this._cache.set(t, e)), e;
  }
}
const M = (a, t) => (e) => !(!e.hasComponents(a) || t && e.hasComponents(t));
class F {
  constructor(t = []) {
    this._entities = t;
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
  forEach(t) {
    for (let e = 0; e < this._entities.length; e++)
      t(this._entities[e], e);
  }
  /**
   * @description
   * Iterates through each entity asynchronously and calls the provided callback function for each entity.
   *
   * @param callback - The callback function to be called for each entity.
   * @returns A promise that resolves when all iterations are completed.
   */
  async sequential(t) {
    let e = 0;
    for (const s of this._entities)
      await t(s, e), e += 1;
  }
  /**
   * @description
   * Iterates through each entity asynchronously and calls the provided callback function for each entity in parallel.
   *
   * @param callback - The callback function to be called for each entity.
   * @returns A promise that resolves when all iterations are completed.
   */
  async parallel(t) {
    const e = this._entities.map(t);
    await Promise.all(e);
  }
}
const S = class S {
  /**
   * @description
   * Increment the frequency of a given component type.
   *
   * @param component The component to increment the frequency for.
   */
  static increment(t) {
    const e = this._componentFrequency.get(t) ?? 0;
    this._componentFrequency.set(t, e + 1);
  }
  /**
   * @description
   * Decrement the frequency of a given component type. If it reaches zero,
   * remove it from the map.
   *
   * @param component The component to decrement the frequency for.
   */
  static decrement(t) {
    const e = this._componentFrequency.get(t) ?? 0;
    e > 1 ? this._componentFrequency.set(t, e - 1) : this._componentFrequency.delete(t);
  }
  /**
   * @description
   * Get the rarity of a given component type.
   *
   * @param component The component to get the rarity for.
   */
  static rarity(t) {
    return this._componentFrequency.get(t) ?? 0;
  }
  /**
   * @description
   * Sort an array of component types by their rarity.
   *
   * @param components An array of component types to sort.
   * @returns The sorted array of component types.
   */
  static sortByRarity(t) {
    return [...t].sort((e, s) => this.rarity(e) - this.rarity(s));
  }
};
S._componentFrequency = /* @__PURE__ */ new Map();
let l = S;
class x {
  constructor() {
    this._entities = /* @__PURE__ */ new Map();
  }
  addEntity(t) {
    const { uuid: e, name: s } = t;
    if (this._entities.has(e))
      throw new Error(`Entity with UUID [${s}-${e}] already exists in the storage.`);
    this._entities.set(e, t);
  }
  removeEntity(t) {
    const e = this._entities.get(t);
    if (e)
      return this._entities.delete(t), e;
  }
  getEntity(t) {
    return this._entities.get(t);
  }
  getAllEntities() {
    return Array.from(this._entities.values());
  }
  getActiveEntities() {
    return Array.from(this._entities.values()).filter((t) => t.active);
  }
  getInactiveEntities() {
    return Array.from(this._entities.values()).filter((t) => !t.active);
  }
  filter(t, e) {
    let s = e ? this.getAllEntities() : this.getActiveEntities();
    if (t.excludes || (t.excludes = []), t != null && t.includes.length || t != null && t.excludes.length) {
      const i = l.sortByRarity(t.includes), r = t.excludes.length ? l.sortByRarity(t.excludes) : void 0, n = M(i, r);
      s = s.filter(n);
    }
    return new F(s);
  }
}
class P {
  constructor(t, e) {
    this._systemsContainer = t, this._entityStorage = e, this._isPaused = !1, this._resumePromise = null, this._resolveResume = null, this._queue = [], this._groups = [];
  }
  get groups() {
    return this._groups;
  }
  async execute(t, e) {
    var s;
    for (this._queue = this.setExecutionQueue(t, e); this._queue.length > 0; ) {
      this._isPaused && await this.waitForResume();
      const i = this._queue.shift();
      if (i) {
        const r = i.canExecute();
        if (((s = this._currentGroup) == null ? void 0 : s.uuid) !== i.groupId && (this._currentGroup = this._groups.find((n) => n.uuid === i.groupId)), r) {
          const n = { includes: i.includes, excludes: i.excludes };
          i.system.setContext(i.groupId, this._entityStorage), u.instance.getDependencyForSystem(i.groupId, i.system), await i.system.run(i.data, n, i.withDisabled);
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
    return this._resumePromise || (this._resumePromise = new Promise((t) => {
      this._resolveResume = t;
    })), this._resumePromise;
  }
  setExecutionQueue(t, e) {
    const s = [];
    return e.forEach((i) => {
      if (i.canExecute(t)) {
        const r = i.group.sorted(t), n = i.group.uuid;
        this._groups.push(i.group), r.forEach((o) => {
          const h = this._systemsContainer.get(o.instance.system);
          for (let c = 0; c < o.repeat; c++)
            s.push({
              ...o,
              data: o.instance.data,
              groupId: n,
              system: h
            });
        });
      }
    }), s;
  }
}
class p {
  constructor(t, e) {
    this._systemStorage = t, this._entityStorage = e, this._pairs = /* @__PURE__ */ new Map(), this._disposables = [], this._executors = [];
  }
  /**
   * @description Creates bindings between a signal and a group using a configuration.
   *
   * @param configs - Signal-Group bindings.
   * @param controller - The controller for creating group instances.
   */
  static factory(t, e) {
    t.forEach((s) => {
      s.executions.forEach((i) => {
        e.inject(s.signal, i);
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
  static override(t, e) {
    const s = /* @__PURE__ */ new Map();
    for (const i of t)
      s.set(i.signal, { ...i, executions: [...i.executions] });
    for (const i of e)
      if (s.has(i.signal)) {
        const r = s.get(i.signal), n = /* @__PURE__ */ new Map();
        for (const o of r.executions)
          n.set(o.order ?? n.size + 1, { ...o });
        for (const o of i.executions)
          o.order !== void 0 && n.has(o.order) ? n.set(o.order, { ...o }) : n.set(o.order ?? n.size + 1, {
            ...o
          });
        r.executions = Array.from(n.values()).sort(
          (o, h) => o.order - h.order
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
  inject(t, e) {
    const s = this._pairs.get(t) || [], i = new e.group();
    i.registerGroupDependencies();
    const r = e.canExecute ? e.canExecute : (h) => !0, n = {
      group: i,
      canExecute: r,
      order: e.order ? e.order : 0
    };
    s.push(n), s.forEach((h, c) => {
      h.order || (h.order = (c + 1) * 1e4);
    });
    const o = s.sort((h, c) => (h.order || 0) - (c.order || 0));
    this._pairs.set(t, o);
  }
  /**
   * @description Triggers a signal with the provided data.
   *
   * @param signal - The signal.
   * @param data - The data to be passed when triggering the signal.
   */
  dispatch(t, e) {
    t.dispatch(e);
  }
  /**
   * @description Subscribes to signals.
   */
  subscribe() {
    Array.from(this._pairs.keys()).forEach((e) => {
      const s = e.subscribe(async (i) => {
        const r = this._pairs.get(e) || [], n = new P(this._systemStorage, this._entityStorage);
        this._executors.push(n), await n.execute(i, r);
        const o = this._executors.indexOf(n);
        this._executors.splice(o, 1);
      });
      this._disposables.push(s);
    });
  }
  /**
   * @description Unsubscribes from signals.
   */
  unsubscribe() {
    this._disposables.forEach((t) => t.dispose()), this._pairs.clear(), this.stop(), this._executors.length = 0;
  }
  /**
   * @description Clears all groups.
   */
  stop() {
    this._executors.forEach((t) => t.stop());
  }
  /**
   * @description Pauses all groups.
   */
  pause() {
    this._executors.forEach((t) => t.pause());
  }
  /**
   * @description Resumes all groups.
   */
  resume() {
    this._executors.forEach((t) => t.resume());
  }
}
class k {
  constructor(t, e, s, i) {
    this._uuid = t, this._timerController = e, this._onComplete = s, this._duration = i, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  update(t) {
    this._elapsedTime += t * 1e3, this._elapsedTime >= this._duration && (this._onComplete(), this._timerController.clear(this.uuid));
  }
}
class I {
  constructor(t, e, s) {
    this._uuid = t, this._onComplete = e, this._duration = s, this._elapsedTime = 0;
  }
  get uuid() {
    return this._uuid;
  }
  onComplete() {
    return this._onComplete;
  }
  update(t) {
    this._elapsedTime += t * 1e3, this._elapsedTime >= this._duration && (this._elapsedTime = 0, this._onComplete());
  }
}
class $ {
  constructor() {
    this.promise = new Promise((t, e) => {
      this.resolve = t, this.reject = e;
    });
  }
  /*
   * @description - Resolves all promises in an array with the same data.
   */
  static resolveAll(t, e) {
    t.forEach((s) => s.resolve(e));
  }
  /*
   * @description - Rejects all promises in an array with the same reason.
   */
  static rejectAll(t, e) {
    t.forEach((s) => s.reject(e));
  }
  /*
   * @description - Returns a promise that resolves when all promises in the array are resolved.
   */
  static all(t) {
    return Promise.all(t.map((e) => e.promise));
  }
  /*
   * @description - Returns a promise that resolves when all promises in the array are settled.
   */
  static allSettled(t) {
    return Promise.allSettled(t.map((e) => e.promise));
  }
  /*
   * @description - Returns a promise that resolves when any promise in the array is resolved.
   */
  static race(t) {
    return Promise.race(t.map((e) => e.promise));
  }
}
class f {
  constructor() {
    this._updatables = /* @__PURE__ */ new Map();
  }
  /**
   * @description Creates a new timer.
   * @param callback - The function that will be called when the timer completes.
   * @param duration - The duration of the timer in milliseconds.
   * @returns The ID of the created timer.
   */
  setTimeout(t, e) {
    const s = _.uuid(), i = new k(s, this, t, e);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description Creates a new interval.
   * @param callback - The function that will be called on each tick of the interval.
   * @param duration - The duration of each interval tick in milliseconds.
   * @returns The ID of the created interval.
   */
  setInterval(t, e) {
    const s = _.uuid(), i = new I(s, t, e);
    return this._updatables.set(s, i), s;
  }
  /**
   * @description Creates a new code execution delay.
   * @param duration - The delay duration in milliseconds.
   * @returns An object with the methods `wait` and `resolve`. The `wait` method returns a promise that resolves after the specified duration.
   * The `resolve` method immediately resolves the promise and removes the timer from the controller.
   */
  sleep(t) {
    const e = new $(), s = this.setTimeout(() => e.resolve(), t);
    return {
      id: s,
      wait: async () => await e.promise,
      resolve: () => {
        e.resolve(), this.clear(s);
      }
    };
  }
  /**
   * @description Stops the timer or interval by its ID.
   * @param uuid - The ID of the timer or interval.
   */
  clear(t) {
    this._updatables.has(t) && this._updatables.delete(t);
  }
  /**
   * @description Updates all timers and intervals.
   * @param deltaTime - The time between frames in milliseconds.
   */
  update(t) {
    Array.from(this._updatables.values()).forEach((s) => s.update(t));
  }
}
class m {
  constructor(t = "Signal") {
    this._name = t, this.listeners = [], this._uuid = _.uuid();
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
  subscribe(t) {
    return this.listeners.push({ callback: t, once: !1 }), {
      dispose: () => {
        this.unsubscribe(t);
      }
    };
  }
  /**
   * @description Subscribes to the signal only once.
   * @param callback - The callback function that will be called when the signal is dispatched.
   * @returns - A disposable object that can be used to unsubscribe from the signal.
   */
  once(t) {
    return this.listeners.push({ callback: t, once: !0 }), {
      dispose: () => {
        this.unsubscribe(t);
      }
    };
  }
  /**
   * @description Unsubscribes from the signal.
   * @param callback - The callback function that was subscribed to the signal.
   */
  unsubscribe(t) {
    this.listeners = this.listeners.filter((e) => e.callback !== t);
  }
  /**
   * @description Dispatches the signal.
   * @param data - The data that will be passed to the callback functions.
   */
  dispatch(t) {
    const e = [];
    for (const s of this.listeners)
      s.callback(t), s.once && e.push(s.callback);
    e.length > 0 && (this.listeners = this.listeners.filter((s) => !e.includes(s.callback)));
  }
}
const A = new m();
class g {
  constructor() {
    this._lastTime = 0, this._paused = !1, this._speedMultiplier = 1, this._onUpdate = [], this.animate = (t) => {
      if (!this._paused) {
        if (this._lastTime !== 0) {
          const e = (t - this._lastTime) / 1e3;
          this.update(e);
        }
        this._lastTime = t, requestAnimationFrame(this.animate);
      }
    };
  }
  init() {
    requestAnimationFrame(this.animate);
  }
  addUpdateCallback(t) {
    this._onUpdate.push(t);
  }
  removeUpdateCallback(t) {
    this._onUpdate = this._onUpdate.filter((e) => e !== t);
  }
  /**
   * Pauses the application.
   */
  pause(t) {
    this._paused = t;
  }
  /**
   * Sets the speed multiplier for the application.
   */
  setSpeedMultiplier(t) {
    this._speedMultiplier = t;
  }
  update(t) {
    if (this._paused) return;
    const e = t * this._speedMultiplier;
    this._onUpdate.forEach((s) => s(e)), A.dispatch({
      deltaTime: t,
      speedMultiplier: this._speedMultiplier,
      multipliedDelta: e
    });
  }
}
class j {
  init() {
    this.registerServices();
    const t = u.instance.get(g), e = u.instance.get(f);
    t.addUpdateCallback((s) => {
      e.update(s);
    }), t.init();
  }
  listen(t) {
    const e = u.instance.get(p);
    p.factory(t, e), e.subscribe();
  }
  registerGlobalServices(t) {
    u.instance.registerGlobal(t);
  }
  registerServices() {
    const t = new x(), e = new w(), s = new g(), i = new f(), r = new p(e, t);
    this.registerGlobalServices([
      { provide: x, useFactory: () => t },
      { provide: w, useFactory: () => e },
      { provide: g, useFactory: () => s },
      { provide: f, useFactory: () => i },
      { provide: p, useFactory: () => r }
    ]);
  }
}
const y = new m(), b = new m(), v = new m();
class U {
  constructor(t, e) {
    this._states = /* @__PURE__ */ new Map(), this._started = !1, this._name = t.name, this._hooks = e, this._store = t.store, this._guards = t.guards ?? {}, this._initialState = t.initialState, this.setupStates(t.states);
  }
  get name() {
    return this._name;
  }
  get currentState() {
    return this._currentState;
  }
  get currentStateName() {
    return this._currentState.name;
  }
  get previousState() {
    return this._prevStateName;
  }
  get states() {
    return Array.from(this._states.values());
  }
  get store() {
    return this._store;
  }
  listen(t) {
    const e = [];
    this._states.forEach((s) => {
      s.onEnter && e.push(this.formatGroups(s, s.onEnter, y)), s.onExit && e.push(this.formatGroups(s, s.onExit, b)), s.onTransition && e.push(this.formatGroups(s, s.onTransition, v));
    }), e.forEach((s) => {
      s.executions.forEach((i) => {
        t.inject(s.signal, i);
      });
    });
  }
  formatGroups(t, e, s) {
    const i = (n) => n.fsmName !== this._name ? !1 : this._currentState ? this.currentStateName === t.name : !1, r = e.map((n) => ({ group: n, canExecute: (o) => i(o) }));
    return {
      signal: s,
      executions: r
    };
  }
  start(t) {
    this._started || (this._started = !0, this.setupInitialState(t ?? this._initialState));
  }
  canTransitTo(t) {
    return Object.values(this._currentState.transitions).some((e) => e === t);
  }
  canSend(t) {
    return !!(this._currentState.transitions[t] ?? this._currentState.transitions["*"]);
  }
  isIn(t) {
    return this._currentState.name === t;
  }
  transitTo(t) {
    var s, i, r, n, o, h, c, d;
    if (!this.canTransitTo(t))
      throw new Error(`Cannot transit from ${this._currentState.name} to ${t}`);
    if (this.isGuardBlocked(t))
      return;
    (s = this._currentState.subMachine) == null || s.stop(), b.dispatch({
      fsmName: this._name,
      from: this._currentState.name,
      to: t,
      store: this._store
    }), (r = (i = this._hooks) == null ? void 0 : i.onExitState) == null || r.call(i, this._currentState.name, this._store), v.dispatch({
      fsmName: this._name,
      from: this._currentState.name,
      to: t,
      store: this._store
    });
    const e = this._states.get(t);
    if (!e) throw new Error(`[FSM:${this._name}] Target state "${t}" not found`);
    this._prevStateName = this._currentState.name, this._currentState = e, (o = (n = this._hooks) == null ? void 0 : n.onAnyTransition) == null || o.call(n, this._prevStateName, t, this._store), (c = (h = this._hooks) == null ? void 0 : h.onEnterState) == null || c.call(h, this._currentState.name, this._store), y.dispatch({
      fsmName: this._name,
      from: this._currentState.name,
      to: t,
      store: this._store
    }), (d = this._currentState.subMachine) == null || d.start();
  }
  send(t) {
    var s, i, r, n, o;
    const e = this._currentState.transitions[t] ?? this._currentState.transitions["*"];
    if (!e)
      throw (i = (s = this._hooks) == null ? void 0 : s.onUnhandledEvent) == null || i.call(s, t, this._currentState.name, this._store), new Error(`[FSM:${this._name}] No transition for event "${t}" in state "${this._currentState.name}"`);
    (o = (n = (r = this._hooks) == null ? void 0 : r.onEvent) == null ? void 0 : n[t]) == null || o.call(n, this._store), this.transitTo(e);
  }
  stop() {
    var t, e, s;
    (t = this._currentState.subMachine) == null || t.stop(), b.dispatch({
      fsmName: this._name,
      from: this._currentState.name,
      to: this._currentState.name,
      store: this._store
    }), (s = (e = this._hooks) == null ? void 0 : e.onExitState) == null || s.call(e, this._currentState.name, this._store), this._started = !1;
  }
  isGuardBlocked(t) {
    var i, r, n;
    const e = (i = Object.entries(this._currentState.transitions).find(([, o]) => o === t)) == null ? void 0 : i[0], s = e ? this._guards[e] : void 0;
    return s && !s(this._store) ? ((n = (r = this._hooks) == null ? void 0 : r.onBlockedByGuard) == null || n.call(r, this._currentState.name, t, this._store), !0) : !1;
  }
  setupStates(t) {
    for (const e of t)
      this._states.set(e.name, e);
  }
  setupInitialState(t) {
    var s, i, r;
    const e = this._states.get(t);
    if (!e) throw new Error(`State ${t} not found`);
    this._currentState = e, (i = (s = this._hooks) == null ? void 0 : s.onEnterState) == null || i.call(s, this._currentState.name, this._store), y.dispatch({
      fsmName: this._name,
      from: this._currentState.name,
      to: this._currentState.name,
      store: this._store
    }), (r = this._currentState.subMachine) == null || r.start();
  }
}
class E {
  constructor() {
    this._items = [];
  }
  get items() {
    return this._items;
  }
  set(t) {
    this._items.push(t);
  }
  get(t) {
    return this._items.find((e) => e instanceof t);
  }
  has(t) {
    return !!this.get(t);
  }
  delete(t) {
    const e = this.get(t);
    return e && (this._items = this.items.filter((s) => s.constructor !== t)), !!e;
  }
  clear() {
    this._items.length = 0;
  }
}
class q {
  constructor(t, e = "Entity") {
    this._uuid = t, this._name = e, this._active = !0, this._components = new E(), this._disabledComponents = new E();
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
  set name(t) {
    this._name = t;
  }
  /**
   * @description
   * Whether the entity is currently active.
   */
  get active() {
    return this._active;
  }
  set active(t) {
    this._active = t;
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
  addComponent(t, e = !0) {
    const s = this.extractConstructor(t);
    if (this._components.has(s) || this._disabledComponents.has(s))
      throw new Error(
        `Component of type ${s.name} already exists in entity [${this._name}-${this._uuid}]`
      );
    e ? (this._components.set(t), l.increment(s)) : (this._disabledComponents.set(t), l.decrement(s));
  }
  /**
   * @description Gets a component by its constructor function.
   * @param ctor The constructor function of the component.
   * @returns The component instance, or null if no such component was found.
   */
  getComponent(t) {
    const e = this._components.get(t);
    if (!e)
      throw new Error(
        `Component of type ${t.name} is not found in [${this.name}-${this.uuid}].`
      );
    return e;
  }
  /**
   * @description Checks whether the entity has at least one of the specified components.
   * @param types An array of component constructors.
   * @returns True if the entity has at least one of the specified components, false otherwise.
   */
  hasComponents(t) {
    return t.every((e) => !!this._components.get(e));
  }
  /**
   * @description Removes a component from the entity.
   * @param ctor The constructor function of the component to be removed.
   * @returns The removed component instance.
   */
  removeComponent(t) {
    let e;
    if (this._components.has(t) ? (e = this._components.get(t), this._components.delete(t)) : this._disabledComponents.has(t) && (e = this._disabledComponents.get(t), this._disabledComponents.delete(t)), !e)
      throw new Error(
        `Component type ${t.name} does not exist in entity [${this._name}-${this._uuid}]`
      );
    return l.decrement(t), e;
  }
  /**
   * @description
   * Enables a previously disabled component. If the component doesn't exist or is already enabled, throws an error.
   *
   * @param ctor The constructor function of the component to be enabled.
   */
  enableComponent(t) {
    if (!this._disabledComponents.has(t))
      throw new Error(
        `Cannot enable component of type ${t.name} - it does not exist or is already enabled.`
      );
    const e = this._disabledComponents.get(t);
    this._disabledComponents.delete(t), this._components.set(e), l.increment(t);
  }
  /**
   * @description
   * Disables a component. If the component doesn't exist or is already disabled, throws an error.
   *
   * @param ctor The constructor function of the component to be disabled.
   */
  disableComponent(t) {
    if (!this._components.has(t))
      throw new Error(
        `Cannot disable component of type ${t.name} - it does not exist or is already disabled.`
      );
    const e = this._components.get(t);
    this._components.delete(t), this._disabledComponents.set(e), l.decrement(t);
  }
  /**
   * @description Disables all components on the entity.
   */
  disableAllComponents() {
    for (const t of this._components.items)
      this._disabledComponents.set(t), l.decrement(t.constructor);
    this._components.clear();
  }
  /**
   * @description Enables all components that were previously disabled.
   */
  enableAllComponents() {
    for (const t of this._disabledComponents.items)
      this._components.set(t), l.increment(t.constructor);
    this._disabledComponents.clear();
  }
  /**
   * Checks whether the entity meets the specified filtering criteria.
   * @param filter - The filter criteria.
   * @returns True if the entity satisfies the filter, false otherwise.
   */
  isSatisfiedFilter(t) {
    const e = t.includes || [], s = t.excludes || [];
    return this.hasComponents(e) && (!s.length || !this.hasComponents(s));
  }
  extractConstructor(t) {
    return t.constructor;
  }
}
class G {
  constructor(t, e = {}) {
    this._data = t, this.listeners = /* @__PURE__ */ new Set(), this.middleware = [], this.validators = [], this.history = [], this.historyIndex = -1, this.middleware = e.middleware || [], this.validators = e.validators || [], this.historySize = e.historySize || 10, this.pushToHistory(this._data);
  }
  /**
   * Get current state using Proxy to prevent direct mutations
   */
  get state() {
    return new Proxy(this._data, {
      get: (t, e) => {
        const s = t[e];
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
  subscribe(t) {
    return this.listeners.add(t), () => this.listeners.delete(t);
  }
  /**
   * Update state using callback
   * @param callback Function that returns partial update
   * @throws Error if validation fails
   */
  setState(t) {
    const e = t(this.state);
    for (const i of this.validators) {
      const r = i(e);
      if (r !== !0)
        throw new Error(typeof r == "string" ? r : "Validation failed");
    }
    let s = this.middleware.length ? this._data : { ...this._data, ...e };
    for (const i of this.middleware)
      s = i(s, e, this.applyUpdate);
    this._data = s, this.pushToHistory(s), this.notifyListeners();
  }
  /**
   * Execute a transaction that can be rolled back
   * @param transaction Transaction object with apply and rollback functions
   */
  transaction(t) {
    const e = this.state;
    try {
      this._data = t.apply(this.state), this.pushToHistory(this._data), this.notifyListeners();
    } catch (s) {
      throw this._data = t.rollback(e), this.notifyListeners(), s;
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
  reset(t = {}) {
    this._data = t, this.history = [], this.historyIndex = -1, this.pushToHistory(this._data), this.notifyListeners();
  }
  applyUpdate(t, e) {
    return { ...t, ...e };
  }
  pushToHistory(t) {
    this.historyIndex++, this.history = this.history.slice(0, this.historyIndex).concat([{ ...t }]), this.history.length > this.historySize && (this.history = this.history.slice(-this.historySize), this.historyIndex = this.history.length - 1);
  }
  notifyListeners() {
    this.listeners.forEach((t) => t(this.state));
  }
}
export {
  l as ComponentsRaritySorter,
  $ as DeferredPromise,
  q as Entity,
  x as EntityStorage,
  P as Executor,
  U as FSM,
  D as Inject,
  j as MyshApp,
  y as OnStateEnterSignal,
  b as OnStateExitSignal,
  v as OnStateTransitionSignal,
  A as OnUpdateSignal,
  u as ServiceContainer,
  m as Signal,
  p as SignalController,
  G as Store,
  C as System,
  T as SystemGroup,
  w as SystemsContainer,
  f as TimerController,
  g as UpdateLoop,
  _ as Utils
};
