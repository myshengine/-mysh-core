import { System, SystemType } from "@logic/system";
import { Token } from "../models";
import { SystemGroup } from "@execution/system-group";
import { ServiceContainer } from "../services.container";

export function Inject<T>(token: Token<T>) {
    if (!token) {
      throw new Error('Token must be provided to @Inject decorator when not using reflect-metadata');
    }
    return function(target: any, propertyKey: string) {
  
      let moduleId = 'global';
  
      if (target instanceof System) {
        
        Object.defineProperty(target, 'injectHere', {
            value:"injectHere", 
            enumerable: false, 
            configurable: false
        });

        Object.defineProperty(target, propertyKey, {
            value: null
        });
        
        ServiceContainer.instance.memorizeSystem(target.constructor as SystemType<any, any>, token, propertyKey);
        return;
      }
  
      if(target instanceof SystemGroup) {
        moduleId = target.uuid || 'global';
      }
  
      Object.defineProperty(target, propertyKey, {
        get: () => ServiceContainer.instance.get(token, moduleId),
        enumerable: true,
        configurable: false,
      });
    };
  }