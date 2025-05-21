// import { Store } from './store';
// import { Middleware, Validator } from './types';

// interface GameState {
//     player: string;
//     health: number;
//     stamina: number;
//     mana: number;
//     items: Map<string, number>;
// }

// // Пример middleware для логирования
// const loggerMiddleware: Middleware<GameState> = (state, update, next) => {
//     console.log('Previous state:', state);
//     console.log('Update:', update);
//     const nextState = next(state, update);
//     console.log('Next state:', nextState);
//     return nextState;
// };

// // Пример middleware для проверки здоровья
// const healthMiddleware: Middleware<GameState> = (state, update, next) => {
//     const nextState = next(state, update);
//     if ('health' in update && nextState.health < 0) {
//         return { ...nextState, health: 0 };
//     }
//     return nextState;
// };

// // Пример валидатора
// const statsValidator: Validator<GameState> = (update) => {
//     if ('health' in update && (update.health < 0 || update.health > 200)) {
//         return 'Health must be between 0 and 200';
//     }
//     if ('stamina' in update && (update.stamina < 0 || update.stamina > 200)) {
//         return 'Stamina must be between 0 and 200';
//     }
//     if ('mana' in update && (update.mana < 0 || update.mana > 200)) {
//         return 'Mana must be between 0 and 200';
//     }
//     return true;
// };

// // Создаем store с middleware и валидаторами
// const gameStore = new Store<GameState>(
//     {
//         player: 'Player1',
//         health: 100,
//         stamina: 100,
//         mana: 100,
//         items: new Map(),
//     },
//     {
//         middleware: [loggerMiddleware, healthMiddleware],
//         validators: [statsValidator],
//         historySize: 20, // Хранить историю последних 20 изменений
//     }
// );

// // Подписываемся на изменения
// const unsubscribe = gameStore.subscribe((state) => {
//     console.log('State updated:', state);
// });

// // Пример использования транзакции
// const useHealthPotion = {
//     apply: (state: GameState) => ({
//         ...state,
//         health: state.health + 50,
//         items: new Map(state.items).set('healthPotion', (state.items.get('healthPotion') || 0) - 1),
//     }),
//     rollback: (state: GameState) => ({
//         ...state,
//         health: state.health - 50,
//         items: new Map(state.items).set('healthPotion', (state.items.get('healthPotion') || 0) + 1),
//     }),
// };

// // Применяем изменения
// try {
//     // Обычное обновление
//     gameStore.setState(state => ({
//         health: state.health - 30,
//         stamina: state.stamina - 20,
//     }));

//     // Транзакция
//     gameStore.transaction(useHealthPotion);

//     // Отменяем последнее изменение
//     gameStore.undo();

//     // Возвращаем отмененное изменение
//     gameStore.redo();
// } catch (error) {
//     console.error('Failed to update state:', error);
// }

// // Отписываемся от изменений
// unsubscribe();
