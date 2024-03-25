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
        update: {
            url: '/sys-menu/update',
            method: 'post',
        },
        delete: {
            url: '/sys-menu/delete',
            method: 'post',
        },
        hide: {
            url: '/sys-menu/hide',
            method: 'post',
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
        update: {
            url: '/sys-role/update',
            method: 'post',
        },
        delete: {
            url: '/sys-role/delete',
            method: 'post',
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
        update: {
            url: '/sys-user/update',
            method: 'post',
        },
        delete: {
            url: '/sys-user/delete',
            method: 'post',
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
