import { AxiosError, AxiosRequestConfig } from 'axios';

export interface UseAxiosProps extends AxiosRequestConfig {
    // 是否手动执行（设置为否的话组件加载后自动执行）
    manual?: boolean | (() => boolean);
    // 是否自动取消上一个请求（避免重复请求）
    cancelPrev?: boolean;
}

export interface UseAxiosState<T> {
    // 加载状态
    loading: boolean;
    // 返回对象
    resp?: T;
    // 异常对象
    err?: Error;
    // 请求方法
    fetch: (config?: AxiosRequestConfig) => Promise<T>;
    // 重置数据
    reset: () => void;
}

export interface Action<T> {
    type: string;
    payload?: Payload<T>;
}

export interface Payload<T> {
    err?: AxiosError;
    resp?: T;
}

export enum ActionType {
    REQUEST_START = 'REQUEST_START',
    REQUEST_SUCCESS = 'REQUEST_SUCCESS',
    REQUEST_ERROR = 'REQUEST_ERROR',
    RESET = 'RESET',
}
