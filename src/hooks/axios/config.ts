import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API } from '../../api';
import { AuthToken } from '../../utils/auth-token';

const AUTH_EXLUDE_URLS = [API.URL.AUTH_LOGIN, API.URL.AUTH_REFRESH];

let isRefreshing = false;
let requests: ((data?: API.JwtToken) => void)[] = [];

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
            .post(API.URL.AUTH_REFRESH, { refreshToken: token.refreshToken })
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
        requests.push((data?: API.JwtToken) => {
            if (data) config.headers['Authorization'] = `${data.tokenType} ${data.accessToken}`;
            resolve(config);
        });
    });
    return retry;
});

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, data, message } = response.data;
        if (code === API.CODE.SUCCESS && response.config.url === API.URL.AUTH_LOGIN) AuthToken.save(data);

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
        const responseMessage = (response?.data as API.Res<unknown>)?.message;
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
