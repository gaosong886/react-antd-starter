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

axiosInstance.interceptors.request.use((config) => {
    if (config.url && AUTH_EXLUDE_URLS.includes(config.url)) return config;

    const token = AuthToken.get();
    if (!token) return config;

    const [accessTokenExpired, refreshTokenExpired] = AuthToken.isExpired(token);

    if (!accessTokenExpired) {
        config.headers['Authorization'] = `${token.tokenType} ${token.accessToken}`;
        return config;
    }

    if (refreshTokenExpired) return config;

    if (!isRefreshing) {
        isRefreshing = true;
        axiosInstance
            .post(API.AUTH_REFRESH, { refreshToken: token.refreshToken })
            .then((res) => {
                AuthToken.save(res.data.data);
                isRefreshing = false;
                requests.forEach((cb) => cb(res.data.data));
                requests = [];
            })
            .catch((err) => {
                console.log(err);
                isRefreshing = false;
                requests.forEach((cb) => cb());
                requests = [];
                throw err;
            });
    }

    const retry = new Promise<InternalAxiosRequestConfig<unknown>>((resolve) => {
        requests.push((data?: JwtToken) => {
            if (data) config.headers['Authorization'] = `${data.tokenType} ${data.accessToken}`;
            resolve(config);
        });
    });
    return retry;
});

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, data, message } = response.data;
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
