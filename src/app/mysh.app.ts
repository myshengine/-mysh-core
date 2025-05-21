import { Provider, ServiceContainer } from "@containers/services-container";
import { SystemsContainer } from "@containers/systems-container";
import { EntityStorage } from "@data/entity-storage";
import { ISignalConfig, SignalController } from "@execution/signal-controller";
import { TimerController } from "@shared/timer";
import { UpdateLoop } from "@shared/update-loop";

export class MyshApp {

    public init(): void {
        this.registerServices();

        const updateLoop = ServiceContainer.instance.get(UpdateLoop);
        const timerController = ServiceContainer.instance.get(TimerController);

        updateLoop.addUpdateCallback((deltaTime) => {
            timerController.update(deltaTime);
        });

        updateLoop.init();
    }

    public listen(configs: ISignalConfig[]): void {
        const signalController = ServiceContainer.instance.get(SignalController);

        SignalController.factory(configs, signalController);
        signalController.subscribe();
    }

    public registerGlobalServices(providers: Provider[]): void {
        ServiceContainer.instance.registerGlobal(providers);
    }

    protected registerServices(): void {
        const entityStorage = new EntityStorage();
        const systemsContainer = new SystemsContainer();
        const updateLoop = new UpdateLoop();
        const timerController = new TimerController();
        const signalController = new SignalController(systemsContainer, entityStorage);

        this.registerGlobalServices([
            { provide: EntityStorage, useFactory: () => entityStorage }, 
            { provide: SystemsContainer, useFactory: () => systemsContainer },
            { provide: UpdateLoop, useFactory: () => updateLoop },
            { provide: TimerController, useFactory: () => timerController },
            { provide: SignalController, useFactory: () => signalController }
        ]);
    }
}