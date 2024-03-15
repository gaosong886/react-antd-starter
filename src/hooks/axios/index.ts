import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Action, ActionType, UseAxiosState } from './types';
import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosInstance from './config';

export function useAxios<T>({ manual = true, cancelPrev = true, ...axiosRequestConfig }): UseAxiosState<T> {
    const reducer = (state: any, action: Action<T>) => {
        switch (action.type) {
            case ActionType.REQUEST_START:
                return { ...state, loading: true, resp: undefined, err: undefined };
            case ActionType.REQUEST_SUCCESS:
                return { ...state, loading: false, resp: action.payload?.resp, err: undefined };
            case ActionType.REQUEST_ERROR:
                return { ...state, loading: false, resp: action.payload?.resp, err: action.payload?.err };
            case ActionType.RESET:
                return { loading: false };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, {
        loading: false,
    });

    const abortController = useRef<AbortController>();

    const fetch = useCallback(
        (config?: AxiosRequestConfig) => {
            dispatch({
                type: ActionType.REQUEST_START,
            });

            if (cancelPrev && abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            axiosInstance
                .request<AxiosRequestConfig>({ ...axiosRequestConfig, ...config, signal: abortController.current.signal })
                .then((res) => {
                    dispatch({
                        type: ActionType.REQUEST_SUCCESS,
                        payload: { resp: res.data as T },
                    });
                })
                .catch((error) => {
                    dispatch({
                        type: ActionType.REQUEST_ERROR,
                        payload: { err: error, resp: error.response?.data },
                    });
                });
        },
        [axiosRequestConfig, cancelPrev]
    );

    const fetchAsync = useCallback(
        async (config?: AxiosRequestConfig) => {
            dispatch({
                type: ActionType.REQUEST_START,
            });

            if (cancelPrev && abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            try {
                const res = await axiosInstance.request<AxiosRequestConfig>({ ...axiosRequestConfig, ...config, signal: abortController.current.signal });
                dispatch({
                    type: ActionType.REQUEST_SUCCESS,
                    payload: { resp: res.data as T },
                });
                return res.data as T;
            } catch (error) {
                dispatch({
                    type: ActionType.REQUEST_ERROR,
                    payload: { err: error as Error, resp: (error as AxiosError).response?.data as T },
                });
                return (error as AxiosError).response?.data as T;
            }
        },
        [axiosRequestConfig, cancelPrev]
    );

    const reset = useCallback(() => {
        dispatch({
            type: ActionType.RESET,
        });
    }, []);

    useEffect(() => {
        if (!manual) fetch(axiosRequestConfig);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ...state, fetch, fetchAsync, reset };
}
