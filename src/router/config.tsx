import { RouteObject, Navigate } from 'react-router-dom';
import CommonLayout from '../components/common-layout';
import NotFoundPage from '../pages/errors/404';
import LoginPage from '../pages/login';
import loadable, { DefaultComponent } from '@loadable/component';
import { Skeleton } from 'antd';

const EXCLUDE_PATHS = ['login', 'components', 'utils'];

const isExclude = (path: string): boolean => {
    for (const item of EXCLUDE_PATHS) if (path.includes(item)) return true;
    return false;
};

const getRoutePath = (path: string): string => {
    const pageIndex = path.indexOf('pages') + 5;
    const lastIndex = path.lastIndexOf('index.tsx') - 1;

    return path.substring(pageIndex, lastIndex);
};

const buildRoutes = (pages: Record<string, () => Promise<DefaultComponent<unknown>>>): RouteObject[] => {
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

type PageFiles = Record<string, () => Promise<DefaultComponent<unknown>>>;
const pages = import.meta.glob('../pages/**/index.tsx') as PageFiles;

const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to='/dashboard' replace />,
    },
    {
        element: <CommonLayout />,
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
