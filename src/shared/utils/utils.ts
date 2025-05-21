type Callback = (...args: any[]) => void;

export class Utils {
    public static uuid(): string {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    public static debounce(callback: Callback, delay: number = 0): Callback {
        let timer: ReturnType<typeof setTimeout> | null = null;
    
        return (...args: any[]) => {
            clearTimeout(timer!);
    
            timer = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }
}