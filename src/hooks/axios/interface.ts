import { AxiosRequestConfig } from 'axios';

export interface UseAxiosProps extends AxiosRequestConfig {
    manual?: boolean | (() => boolean);
    cancelPrev?: boolean;
}

export interface UseAxiosState<T> {
    loading: boolean;
    resp?: T;
    err?: Error;
    fetch: (config?: AxiosRequestConfig) => void;
    fetchAsync: (config?: AxiosRequestConfig) => Promise<T>;
    reset: () => void;
}
