import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthToken } from '../../utils/auth-token';
import { JwtToken, ResCode, Res } from '../../api/types';
import { API } from '../../api/constants';

const AUTH_EXLUDE_URLS = [API.AUTH_LOGIN, API.AUTH_REFRESH];

// 是否正在刷新 JWT
let isRefreshing = false;

// 初始化请求队列
let requests: ((data?: JwtToken) => void)[] = [];

// 初始化 axios 实例
const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_BASE_API_URL, timeout: 3000 });

/**
 * 注册 request 拦截器，将自动为接口请求加入 Authorization 头
 * 当 accessToken 过期时，拦截器将尝试用 refreshToken 刷新
 * 刷新 Token 期间所有需要鉴权的请求将进入等待队列
 * 
 */
axiosInstance.interceptors.request.use((config) => {

    // 不需要验证的 URL 直接放行
    if (config.url && AUTH_EXLUDE_URLS.includes(config.url)) return config;

    // 本地没有 token，直接放行
    const token = AuthToken.get();
    if (!token) return config;

    const [accessTokenExpired, refreshTokenExpired] = AuthToken.isExpired(token);

    // accessToken 没过期，带上 token 发起请求
    if (!accessTokenExpired) {
        config.headers['Authorization'] = `${token.tokenType} ${token.accessToken}`;
        return config;
    }

    // 连 refreshToken 都过期了，放弃拦截直接发起请求
    if (refreshTokenExpired) return config;

    // 走到这里代表 accessToken 过期了，但是 refreshTokenExpired 没过期

    // 判断是否已有刷新 token 的请求正在执行
    if (!isRefreshing) {
        isRefreshing = true;

        // 发起刷新 token 的请求
        axiosInstance
            .post(API.AUTH_REFRESH, { refreshToken: token.refreshToken })
            .then((res) => {
                AuthToken.save(res.data.data);
                isRefreshing = false;

                // 刷新成功，逐个执行等待队列中的回调函数
                requests.forEach((cb) => cb(res.data.data));
                requests = [];
            })
            .catch((err) => {
                isRefreshing = false;
                requests.forEach((cb) => cb());
                requests = [];
                throw err;
            });
    }

    const retry = new Promise<InternalAxiosRequestConfig<unknown>>((resolve) => {
        // 把当前请求以回调函数的方式压入等待队列
        requests.push((data?: JwtToken) => {
            if (data) config.headers['Authorization'] = `${data.tokenType} ${data.accessToken}`;
            resolve(config);
        });
    });
    return retry;
});

/**
 * 注册 response 拦截器，在请求成功/失败时发送相应事件给页面组件
 * 
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, data, message } = response.data;

        // 如果当前是登录请求，登录成功后保存 token
        if (code === ResCode.SUCCESS && response.config.url === API.AUTH_LOGIN) AuthToken.save(data);

        window.dispatchEvent(
            new CustomEvent('requestSuccess', {
                detail: {
                    status: response?.status,
                    url: response.config.url,
                    message: message,
                },
            })
        );
        return response;
    },
    (error: AxiosError) => {
        const { response, message } = error;
        const responseMessage = (response?.data as Res<unknown>)?.message;
        window.dispatchEvent(
            new CustomEvent('requestError', {
                detail: {
                    status: response?.status,
                    url: response?.config.url,
                    message: responseMessage ? responseMessage : message,
                },
            })
        );
        throw error;
    }
);

export default axiosInstance;
