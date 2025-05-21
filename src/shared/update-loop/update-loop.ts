import { OnUpdateSignal } from "./signals";

export class UpdateLoop {
    private _lastTime: number = 0;
    private _paused: boolean = false;
    private _speedMultiplier: number = 1;
    private _onUpdate: Array<(deltaTime: number) => void> = [];

    public init(): void {
        requestAnimationFrame(this.animate);
    }

    public addUpdateCallback(callback: (deltaTime: number) => void): void {
        this._onUpdate.push(callback);
    }

    public removeUpdateCallback(callback: (deltaTime: number) => void): void {
        this._onUpdate = this._onUpdate.filter((cb) => cb !== callback);
    }

    /**
     * Pauses the application.
     */
    public pause(paused: boolean): void {
        this._paused = paused;
    }

    /**
     * Sets the speed multiplier for the application.
     */
    public setSpeedMultiplier(speedMultiplier: number): void {
        this._speedMultiplier = speedMultiplier;
    }

    private animate = (currentTime: number): void => {
        if (this._paused) return;
        if (this._lastTime !== 0) {
            const deltaTime = (currentTime - this._lastTime) / 1000;
            this.update(deltaTime);
        }
        this._lastTime = currentTime;
        requestAnimationFrame(this.animate);
    }

    private update(deltaTime: number): void {
        if (this._paused) return;
        const multipliedDelta = deltaTime * this._speedMultiplier;
        this._onUpdate.forEach((callback) => callback(multipliedDelta));
        
        OnUpdateSignal.dispatch({
            deltaTime,
            speedMultiplier: this._speedMultiplier,
            multipliedDelta,
        });
    }
}