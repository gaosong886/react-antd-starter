import { AxiosRequestConfig } from 'axios';

// 钩子的 props，继承自 AxiosRequestConfig
export interface UseAxiosProps extends AxiosRequestConfig {
    // 是否手动执行（设置为否的话组件加载后自动执行）
    manual?: boolean | (() => boolean);
    // 是否自动取消上一个请求（避免重复请求）
    cancelPrev?: boolean;
}

// 钩子返回的 state
export interface UseAxiosState<T> {
    // 加载状态
    loading: boolean;
    // 返回对象
    resp?: T;
    // 异常对象
    err?: Error;
    // 请求方法（用来手动发起请求）
    fetch: (config?: AxiosRequestConfig) => void;
    // 同步请求方法
    fetchAsync: (config?: AxiosRequestConfig) => Promise<T>;
    // 重置请求
    reset: () => void;
}

// 用来操作钩子内部 state 的 action
export interface Action<T> {
    type: string;
    payload?: Payload<T>;
}

export interface Payload<T> {
    err?: Error;
    resp?: T;
}

export enum ActionType {
    REQUEST_START = 'REQUEST_START',
    REQUEST_SUCCESS = 'REQUEST_SUCCESS',
    REQUEST_ERROR = 'REQUEST_ERROR',
    RESET = 'RESET',
}