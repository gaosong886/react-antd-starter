import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useAxios } from '~/hooks/useAxios';
import { useNavigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '~/api/constants';
import { JwtToken, ResCode, Res, ValidError } from '~/api/types';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // 登录请求状态对象
    const loginReqState = useAxios<Res<JwtToken | ValidError>>({ url: API.AUTH_LOGIN, method: 'post' });

    // 服务端回传的表单校验错误信息
    const validErrors = useMemo(() => (loginReqState.resp?.data as ValidError)?.errors || [], [loginReqState.resp?.data]);

    const handleSubmit = useCallback(
        (formData: Record<string, unknown>) => {
            loginReqState.fetch({ data: formData });
        },
        [loginReqState]
    );

    useEffect(() => {
        // 登录成功，跳转到控制台
        if (loginReqState.resp?.code == ResCode.SUCCESS) navigate('/dashboard');
    }, [loginReqState.resp?.code, navigate]);

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
                <Spin spinning={loginReqState.loading}>
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
                {validErrors &&
                    validErrors.map((msg) => (
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
