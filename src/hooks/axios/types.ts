import { AxiosRequestConfig } from 'axios';

export enum ActionType {
    REQUEST_START = 'REQUEST_START',
    REQUEST_SUCCESS = 'REQUEST_SUCCESS',
    REQUEST_ERROR = 'REQUEST_ERROR',
    RESET = 'RESET',
}

export interface Action<T> {
    type: string;
    payload?: Payload<T>;
}

export interface Payload<T> {
    err?: Error;
    resp?: T;
}

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
