import { MenuDataItem, PageContainer, ProLayout } from '@ant-design/pro-components';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAxios } from '../../hooks/axios';
import { useDispatch } from 'react-redux';
import { Dispatch } from '../../store';
import { useBaseStore } from '../../hooks/base-store';
import { clearUserInfo, setUserInfo } from '../../store/slices/user';
import { Dropdown } from 'antd';
import Icon, { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { AuthToken } from '../../utils/auth-token';
import { clearMenuInfo, setMenuInfo } from '../../store/slices/menu';
import * as icons from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { buildMenuTree } from '../../utils/menu-tree';
import { Res, ResCode, SysMenu, SysUser } from '../../api/types';
import { API } from '../../api/constants';

const loopMenuItem = (menus: any[]): MenuDataItem[] =>
    menus.map(({ icon, children, ...item }) => ({
        ...item,
        icon: icon && <Icon component={(icons as any)[icon as string]} style={{ marginRight: '8px' }} />,
        children: children && loopMenuItem(children),
    }));

/**
 * 通用页面父组件
 */
const BaseLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const dispatch: Dispatch = useDispatch();
    const { userInfo, menuInfo } = useBaseStore();

    const userState = useAxios<Res<SysUser>>({ url: API.USER_PROFILE, method: 'get' });
    const menuState = useAxios<Res<SysMenu[]>>({ url: API.MENU_MENU, method: 'get' });

    useEffect(() => {
        if (menuState.resp?.data) {
            // 把从服务端获取的菜单列表转换成树结构
            const menuTree = buildMenuTree(menuState.resp.data);
            dispatch(setMenuInfo(menuTree.tree));
        }
    }, [dispatch, menuState.resp?.data]);

    useEffect(() => {
        // 保存从服务器得到的用户信息
        if (userState.resp?.code == ResCode.SUCCESS) dispatch(setUserInfo(userState.resp.data));
    }, [dispatch, userState.resp]);

    useEffect(() => {
        // store 中没有用户信息，尝试获取
        if (userInfo.id === 0) userState.fetch();
        // store 没有菜单数据，尝试获取菜单
        if (menuInfo.length === 0) menuState.fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 未登录状态，跳转到登录页
    useEffect(() => {
        if (!AuthToken.get()) navigate('/login');
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
                postMenuData={(menuData?: MenuDataItem[]) => {
                    return loopMenuItem(menuData || []);
                }}
                menu={{ autoClose: false }}
                layout='mix'
                title={t('common.appName')}
                siderWidth={216}
                location={{
                    pathname: location.pathname,
                }}
                avatarProps={{
                    src: userInfo?.photo ? userInfo?.photo : '/profile.jpeg',
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
                menuItemRender={(item, dom) => (
                    <div
                        onClick={() => {
                            if (item.path) navigate(item.path);
                        }}
                    >
                        {dom}
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
