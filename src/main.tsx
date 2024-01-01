import ReactDOM from 'react-dom/client';
import { StyleProvider, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';
import AppRouter from './router';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { App, ConfigProvider, message, notification } from 'antd';
import { useCallback, useEffect } from 'react';
import { HttpStatusCode } from 'axios';
import { API } from './api';

// Internationalization support
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import './locales/config';
import { useTranslation } from 'react-i18next';

const browserLanguage = navigator.language.split('-')[0];

export const AppRoot: React.FC = () => {
    const navigate = useNavigate();
    const [messageApi, messageHolder] = message.useMessage();
    const [notificationApi, notificationHolder] = notification.useNotification();
    const { t } = useTranslation();

    const requestSuccessHandler = useCallback(
        (e: unknown) => {
            const event = e as CustomEvent;
            const statusCode = event.detail.status;
            const url = event.detail.url;
            if (statusCode == HttpStatusCode.Created && !url.includes('/page'))
                notificationApi.success({
                    message: t('common.operationSuccess'),
                    description: event.detail.url,
                    placement: 'bottomRight',
                });
        },
        [notificationApi, t]
    );

    const requestErrorHandler = useCallback(
        (e: unknown) => {
            const event = e as CustomEvent;
            const statusCode = event.detail.status;
            if (statusCode === HttpStatusCode.Unauthorized && event.detail.url !== API.URL.AUTH_LOGIN) {
                navigate('/login');
            } else {
                if (event.detail.url) messageApi.error(`'${event.detail.url}' ${event.detail.message}`);
                else messageApi.error(`${event.detail.message}`);
            }
        },
        [messageApi, navigate]
    );

    useEffect(() => {
        window.addEventListener('requestSuccess', requestSuccessHandler);
        window.addEventListener('requestError', requestErrorHandler);
        return () => {
            window.removeEventListener('requestSuccess', requestSuccessHandler);
            window.removeEventListener('requestError', requestErrorHandler);
        };
    }, [requestErrorHandler, requestSuccessHandler]);

    return (
        <App>
            {messageHolder}
            {notificationHolder}
            <AppRouter />
        </App>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={browserLanguage === 'zh' ? zhCN : enUS}>
        <Provider store={store}>
            <StyleProvider hashPriority='high' transformers={[legacyLogicalPropertiesTransformer]}>
                <BrowserRouter>
                    <AppRoot />
                </BrowserRouter>
            </StyleProvider>
        </Provider>
    </ConfigProvider>
);
