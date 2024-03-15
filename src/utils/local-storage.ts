/**
 * 工具类，用来操作 localStorage
 * 
 */
export class LocalStorage {
    static clear(): void {
        localStorage.clear();
    }

    static remove(key: string): void {
        localStorage.removeItem(key);
    }

    static get<T>(key: string): T | null {
        const value = localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    static set(key: string, payload: unknown): void {
        localStorage.setItem(key, JSON.stringify(payload));
    }
}
