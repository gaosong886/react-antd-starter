import { message, notification } from 'antd';
import { HttpStatusCode } from 'axios';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '~/api';

/**
 * 全局消息通知组件
 */
export const BaseMessageHolder: React.FC = () => {
    const navigate = useNavigate();

    // 全局顶部消息提示
    const [messageApi, messageHolder] = message.useMessage();

    // 全局右下角消息通知
    const [notificationApi, notificationHolder] = notification.useNotification();

    // 多语言支持
    const { t } = useTranslation();

    // 处理 HTTP 请求成功事件
    const requestSuccessHandler = useCallback(
        (e: unknown) => {
            const event = e as CustomEvent;
            const statusCode = event.detail.status;
            const url = event.detail.url;
            console.log(123123)

            // 返回 201 意味着 '增删改' 操作成功，page 是查询操作不必包含在内
            if (statusCode === HttpStatusCode.Created && !url.includes('/page'))
                // 弹出通知
                notificationApi.success({
                    message: t('common.operationSuccess'),
                    description: event.detail.url,
                    placement: 'bottomRight',
                });
        },
        [notificationApi, t]
    );

    // 处理 HTTP 请求失败事件
    const requestErrorHandler = useCallback(
        (e: unknown) => {
            const event = e as CustomEvent;
            const statusCode = event.detail.status;

            // 返回 401 且当前路径不是登录页时，跳转到登录页
            if (statusCode === HttpStatusCode.Unauthorized && event.detail.url !== api.auth.login.url) {
                navigate('/login');
            } else {
                // 弹出消息框提示错误信息
                if (event.detail.url) messageApi.error(`'${event.detail.url}' ${event.detail.message}`);
                else messageApi.error(`${event.detail.message}`);
            }
        },
        [messageApi, navigate]
    );

    // 注册事件监听器
    useEffect(() => {
        window.addEventListener('requestSuccess', requestSuccessHandler);
        window.addEventListener('requestError', requestErrorHandler);
        return () => {
            // 当组件卸载时，移除事件监听器
            window.removeEventListener('requestSuccess', requestSuccessHandler);
            window.removeEventListener('requestError', requestErrorHandler);
        };
    }, [requestErrorHandler, requestSuccessHandler]);

    return (
        <>
            {messageHolder}
            {notificationHolder}
        </>
    );
};
