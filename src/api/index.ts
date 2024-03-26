export const api = {
    auth: {
        login: {
            url: '/auth/login',
            method: 'post',
        },
        refresh: {
            url: '/auth/refresh',
            method: 'post',
        },
    },
    menu: {
        list: {
            url: '/sys-menu/list',
            method: 'get',
        },
        menu: {
            url: '/sys-menu/menu',
            method: 'get',
        },
        create: {
            url: '/sys-menu/create',
            method: 'post',
        },
        update: (id: number) => {
            return {
                url: `/sys-menu/update/${id}`,
                method: 'post',
            };
        },
        delete: (id: number) => {
            return {
                url: `/sys-menu/delete/${id}`,
                method: 'post',
            };
        },
        hide: (id: number) => {
            return {
                url: `/sys-menu/hide/${id}`,
                method: 'post',
            };
        },
    },
    role: {
        list: {
            url: '/sys-role/list',
            method: 'get',
        },
        create: {
            url: '/sys-role/create',
            method: 'post',
        },
        update: (id: number) => {
            return {
                url: `/sys-role/update/${id}`,
                method: 'post',
            };
        },
        delete: (id: number) => {
            return {
                url: `/sys-role/delete/${id}`,
                method: 'post',
            };
        },
    },
    permission: {
        list: {
            url: '/sys-permission/list',
            method: 'get',
        },
    },
    user: {
        page: {
            url: '/sys-user/page',
            method: 'post',
        },
        create: {
            url: '/sys-user/create',
            method: 'post',
        },
        update: (id: number) => {
            return {
                url: `/sys-user/update/${id}`,
                method: 'post',
            };
        },
        delete: (id: number) => {
            return {
                url: `/sys-user/delete/${id}`,
                method: 'post',
            };
        },
        photo: {
            url: '/sys-user/photo',
            method: 'post',
        },
        profile: {
            url: '/sys-user/profile',
            method: 'get',
        },
    },
    log: {
        page: {
            url: '/sys-log/page',
            method: 'post',
        },
        truncate: {
            url: '/sys-log/truncate',
            method: 'post',
        },
    },
    scheduledTask: {
        list: {
            url: '/scheduled-task/page',
            method: 'get',
        },
        switch: {
            url: '/scheduled-task/switch',
            method: 'post',
        },
    },
};
