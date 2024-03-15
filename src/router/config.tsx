import { RouteObject, Navigate } from 'react-router-dom';
import BaseLayout from '../components/base-layout';
import NotFoundPage from '../pages/errors/404';
import LoginPage from '../pages/login';
import loadable, { DefaultComponent } from '@loadable/component';
import { Skeleton } from 'antd';

type PageFiles = Record<string, () => Promise<DefaultComponent<unknown>>>;

// 读取 page 目录下的页面文件，得到的页面列表将作为 buildRoutes 的参数生成路由
const pages = import.meta.glob('../pages/**/index.tsx') as PageFiles;

// 构建路由时，不包含的路径
const EXCLUDE_PATHS = ['login', 'components', 'utils'];

/**
 * 判断当前页面是否在 EXCLUDE_PATHS 里
 * 
 */
const isExclude = (path: string): boolean => {
    for (const item of EXCLUDE_PATHS) if (path.includes(item)) return true;
    return false;
};

/**
 * 根据传入的文件路径，生成页面的路由路径
 * 
 * @param path 文件路径
 * @returns 路由路径
 * @example ../pages/dashboard/index.tsx => /dashboard
 * 
 */
const getRoutePath = (path: string): string => {
    const pageIndex = path.indexOf('pages') + 5;
    const lastIndex = path.lastIndexOf('index.tsx') - 1;

    return path.substring(pageIndex, lastIndex);
};

/**
 * 构建路由
 * 
 * @param pages 页面文件列表
 * @returns 路由对象列表
 * 
 */
const buildRoutes = (pages: PageFiles): RouteObject[] => {
    const layouts: RouteObject[] = [];

    for (const key in pages) {
        if (isExclude(key)) continue;

        const path = getRoutePath(key);
        const ComponentNode = loadable(pages[key], {
            fallback: <Skeleton active className='p-30px' paragraph={{ rows: 10 }} />,
        });

        layouts.push({
            path,
            element: <ComponentNode />,
        });
    }

    return layouts;
};

// 路由对象
const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to='/dashboard' replace />,
    },
    {
        element: <BaseLayout />,
        // 自动构建页面路由
        children: buildRoutes(pages),
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export default appRoutes;
