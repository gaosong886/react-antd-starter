/**
 * localStorage 工具类
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

    static set(key: string, payload: object): void {
        localStorage.setItem(key, JSON.stringify(payload));
    }
}
