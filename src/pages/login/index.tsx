import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useAxios } from '../../hooks/axios';
import { API } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const loginState = useAxios<API.Res<API.JwtToken | API.ValidError>>({});
    const validationMsgs = useMemo(() => (loginState.resp?.data as API.ValidError)?.errors || [], [loginState.resp?.data]);
    const { t } = useTranslation();

    const handleSubmit = useCallback(
        (formData: Record<string, unknown>) => {
            loginState.fetch({ url: API.URL.AUTH_LOGIN, method: 'post', data: formData });
        },
        [loginState]
    );

    useEffect(() => {
        if (loginState.resp?.code == API.CODE.SUCCESS) navigate('/dashboard');
    }, [loginState.resp?.code, navigate]);

    return (
        <div
            style={{
                height: '95vh',
            }}
        >
            <LoginForm
                title={t('common.appName')}
                subTitle='react & redux-toolkit & antd & vite'
                onFinish={async (values) => {
                    handleSubmit(values);
                }}
                containerStyle={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f0f2f5',
                }}
            >
                <Spin spinning={loginState.loading}>
                    <ProFormText
                        name='username'
                        fieldProps={{
                            size: 'large',
                            prefix: <UserOutlined className={'prefixIcon'} />,
                        }}
                        placeholder={'admin'}
                        rules={[
                            { min: 5 },
                            { max: 15 },
                            {
                                required: true,
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name='password'
                        fieldProps={{
                            size: 'large',
                            prefix: <LockOutlined className={'prefixIcon'} />,
                        }}
                        placeholder={'12345678'}
                        rules={[
                            { min: 8 },
                            { max: 15 },
                            {
                                required: true,
                            },
                        ]}
                    />
                </Spin>
                {validationMsgs &&
                    validationMsgs.map((msg) => (
                        <Alert
                            style={{
                                marginBottom: 24,
                            }}
                            key={msg}
                            message={msg}
                            type='error'
                            showIcon
                        />
                    ))}
            </LoginForm>
        </div>
    );
};
export default LoginPage;
