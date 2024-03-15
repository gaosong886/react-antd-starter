import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAxios } from '../../hooks/axios';
import { useDispatch } from 'react-redux';
import { Dispatch } from '../../store';
import { useBaseStore } from '../../hooks/base-store';
import { clearUserInfo, setUserInfo } from '../../store/slices/user';
import { Dropdown, Flex } from 'antd';
import Icon, { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { AuthToken } from '../../utils/auth-token';
import { clearMenuInfo, setMenuInfo } from '../../store/slices/menu';
import * as icons from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../utils/menu-tree';
import { Res, ResCode, SysMenu, SysUser } from '../../api/types';
import { API } from '../../api/constants';

const BaseLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const dispatch: Dispatch = useDispatch();
    const { userInfo, menuInfo } = useBaseStore();

    const userState = useAxios<Res<SysUser>>({ url: API.USER_PROFILE, method: 'get' });
    const menuState = useAxios<Res<SysMenu[]>>({ url: API.MENU_MENU, method: 'get' });

    const menuTree = useMemo(() => {
        if (menuState.resp?.data) {
            return buildMenuTree(menuState.resp?.data);
        }
    }, [menuState.resp?.data]);

    useEffect(() => {
        if (!AuthToken.get()) navigate('/login');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (userState.resp?.code == ResCode.SUCCESS) dispatch(setUserInfo(userState.resp.data));
    }, [dispatch, userState.resp]);

    useEffect(() => {
        if (menuTree && menuTree.tree.length > 0) dispatch(setMenuInfo(menuTree.tree));
    }, [dispatch, menuTree]);

    useEffect(() => {
        if (userInfo.id === 0) userState.fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (menuInfo.length === 0) menuState.fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            style={{
                height: '100vh',
            }}
        >
            <ProLayout
                route={{
                    path: '/',
                    children: menuInfo,
                }}
                menu={{ autoClose: false }}
                layout='mix'
                title={t('common.appName')}
                siderWidth={216}
                location={{
                    pathname: location.pathname,
                }}
                avatarProps={{
                    src: userState.resp?.data?.photo ? userState.resp?.data?.photo : '/profile.jpeg',
                    size: 'small',
                    render: (_props, dom) => {
                        return (
                            <>
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: 'logout',
                                                icon: <LogoutOutlined />,
                                                label: t('function.logout'),
                                                onClick: () => {
                                                    AuthToken.remove();
                                                    dispatch(clearUserInfo());
                                                    dispatch(clearMenuInfo());
                                                    navigate('/login');
                                                },
                                            },
                                        ],
                                    }}
                                >
                                    {dom}
                                </Dropdown>
                            </>
                        );
                    },
                }}
                subMenuItemRender={(item) => (
                    <Flex>
                        {item.icon && <Icon component={(icons as any)[item.icon as string]} style={{ marginRight: '8px' }} />}
                        {item.name}
                    </Flex>
                )}
                menuItemRender={(item) => (
                    <div
                        onClick={() => {
                            if (item.path) navigate(item.path);
                        }}
                    >
                        <Flex>
                            {item.icon && <Icon component={(icons as any)[item.icon as string]} style={{ marginRight: '8px' }} />}
                            {item.name}
                        </Flex>
                    </div>
                )}
                menuFooterRender={(props) => {
                    if (props?.collapsed) return undefined;
                    return (
                        <div
                            style={{
                                textAlign: 'center',
                                paddingBlockStart: 12,
                            }}
                        >
                            <a href='https://github.com/gaosong886' target='_blank'>
                                <GithubOutlined />
                            </a>
                        </div>
                    );
                }}
            >
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </ProLayout>
        </div>
    );
};
export default BaseLayout;