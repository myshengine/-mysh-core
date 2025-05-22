# Mysh

[![npm version](https://img.shields.io/npm/v/myshengine-core)](https://www.npmjs.com/package/myshengine-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](#)

> 🧠 ECS-фреймворк на TypeScript для архитектурно чистых и масштабируемых игр.

---

## 📖 Оглавление

- [Введение](#введение)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Когда использовать Mysh](#-когда-использовать-mysh)
- [Не подходит, если...](#-не-подходит-если)
- [Основы архитектуры ECS](#основы-архитектуры-ecs)
    - [Entity](#entity)
    - [Component](#component)
    - [System](#system)
- [Управление потоком (Flow)](#управление-потоком-flow)
- [Группы систем (SystemGroup)](#группы-систем-systemgroup)
- [Состояния (FSM)](#состояния-fsm)
- [Дополнительные возможности](#дополнительные-возможности)
    - [Сервисы](#сервисы)
    - [Store](#store)
- [Лицензия](#лицензия)

---

## 🧠 Введение

**Mysh** — это ECS-фреймворк (Entity Component System) на TypeScript, спроектированный для масштабируемой, модульной и легко тестируемой архитектуры. Он не содержит графических или рендеринговых решений, предоставляя разработчику полный контроль над структурой и логикой игры.

---

## 📦 Установка

```bash
npm install myshengine-core
```

---

## 🚀 Быстрый старт

Для запуска достаточно создать экземпляр MyshApp, инициализировать его и настроить прослушку событий:

```ts
const handlers: ISignalConfig[] = [
    {
        signal: OnUpdateSignal,
        executions: [{ group: OnUpdateGroup }],
    },
];

const mysh = new MyshApp();
mysh.init();
mysh.listen(handlers);
```

---

## 🧭 Когда использовать Mysh

Используйте Mysh, если вы:

- Строите масштабируемую архитектуру с низкой связанностью
- Используете рендерер (PixiJS, Cocos, WebGL и пр.) и хотите ECS-ядро
- Предпочитаете event-driven или гибридный подход
- Хотите изолировать игровую логику от рендера
- Работаете с FSM, DI и Store
- Разрабатываете движок или расширяемый фреймворк

---

## 🚫 Не подходит, если...

Mysh **не подойдёт**, если вы:

- Ожидаете встроенный движок с графикой и UI
- Хотите визуальную среду разработки
- Не знакомы с ECS или DI
- Ищете комплексное решение с ассет-менеджментом и анимацией

---

## 🧱 Основы архитектуры ECS

### Entity

Entity — логическое представление игрового объекта. Оно содержит компоненты и предоставляет API для их управления.

```ts
const entity = new Entity('player');
entity.addComponent(new HealthComponent());
entity.removeComponent(HealthComponent);
entity.hasComponents([HealthComponent]);
```

---

### Component

В качестве компонента может выступать любой класс. Это могут быть как простые структуры данных, так и классы с логикой (если это оправдано архитектурно).

```ts
class HealthComponent {
    public value = 100;
}
```

---

### System

Системы реализуют игровую логику. Они независимы друг от друга и работают с сущностями, отфильтрованными по нужным компонентам.

```ts
class DamageSystem extends System {
    public execute(): void {
        const entities = this.filter({ includes: [HealthComponent] });

        entities.forEach((entity) => {
            const health = entity.getComponent(HealthComponent);
            health.value -= 10;
        });
    }
}
```

---

## 🔄 Управление потоком (Flow)

Mysh поддерживает два подхода:

- **Update-driven**: классическое выполнение систем каждый кадр (в Update Loop).
- **Event-driven**: системы выполняются только при необходимости, реагируя на события.

Оба подхода можно свободно комбинировать в рамках одного проекта.

---

## 📚 Группы систем (SystemGroup)

Группы систем позволяют задать точный порядок их выполнения.

```ts
class GameLoopGroup extends SystemGroup {
    public setup(): IGroupOption[] {
        return [
            { instance: this.provide(InputSystem, null) },
            { instance: this.provide(PhysicsSystem, null) },
            { instance: this.provide(RenderSystem, null) },
        ];
    }
}
```

---

## 🧠 Состояния (FSM)

FSM в Mysh — это мощный инструмент для управления игровым потоком. Поддерживаются вложенные состояния, переходы с проверками, глобальное хранилище (Store), события входа/выхода и многое другое.

```ts
const fsm = new FSM({
    name: 'mainFlow',
    initialState: 'boot',
    states: [
        {
            name: 'boot',
            transitions: { init: 'loading' },
            onEnter: [BootGroup],
        },
        {
            name: 'loading',
            transitions: { done: 'play' },
            onEnter: [LoadAssetsGroup],
        },
        {
            name: 'play',
            transitions: { error: 'error' },
        },
    ],
});
```

---

## 🛠 Дополнительные возможности

### Сервисы

Сервисы — это классы с общей логикой, доступные во всех системах и группах через Dependency Injection.

```ts
class LoggerService {
    log(msg: string) {
        console.log(msg);
    }
}

const LOGGER = Symbol('LOGGER');

class MySystem extends System {
    @Inject(LOGGER) private logger!: LoggerService;

    public execute() {
        this.logger.log('System executed');
    }
}
```

```ts
class MyGroup extends SystemGroup {
    public setupDependencies(): Provider[] {
        return [{ provide: LOGGER, useClass: LoggerService }];
    }
}
```

---

### Store

Store — глобальное иммутабельное хранилище данных, интегрируемое в FSM и Системы.

```ts
const store = new Store<{ score: number }>({ score: 0 });

store.setState((state) => ({
    score: state.score + 10,
}));
```

---

## 📄 Лицензия

[MIT License](LICENSE) © 2025 Daniil Stolpnik
