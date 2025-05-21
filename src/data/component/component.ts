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
export type Component = object & { length?: never; constructor: any };

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
export type ComponentType<T extends Component> = new (...args: any[]) => T;
