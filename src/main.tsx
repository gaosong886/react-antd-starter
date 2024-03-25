import ReactDOM from 'react-dom/client';
import AppRouter from '~/router';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '~/store';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import '~/i18n';
import { BaseMessageHolder } from './components/BaseMessageHolder';

const browserLanguage = navigator.language.split('-')[0];

export const AppRoot: React.FC = () => {
    return (
        <App>
            <BaseMessageHolder />
            <AppRouter />
        </App>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={browserLanguage === 'zh' ? zhCN : enUS}>
        <Provider store={store}>
            <BrowserRouter>
                <AppRoot />
            </BrowserRouter>
        </Provider>
    </ConfigProvider>
);
