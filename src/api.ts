export namespace API {
    export const URL = {
        AUTH_LOGIN: '/auth/login',
        AUTH_REFRESH: '/auth/refresh',

        MENU_LIST: '/sys-menu/list',
        MENU_CREATE: '/sys-menu/create',
        MENU_UPDATE: '/sys-menu/update',
        MENU_MENU: '/sys-menu/menu',
        MENU_DELETE: '/sys-menu/delete',
        MENU_HIDE: '/sys-menu/hide',

        ROLE_LIST: '/sys-role/list',
        ROLE_CREATE: '/sys-role/create',
        ROLE_UPDATE: '/sys-role/update',
        ROLE_DELETE: '/sys-role/delete',

        PERMISSION_LIST: '/sys-permission/list',

        USER_PAGE: '/sys-user/page',
        USER_CREATE: '/sys-user/create',
        USER_UPDATE: '/sys-user/update',
        USER_DELETE: '/sys-user/delete',
        USER_PHOTO: '/sys-user/photo',
        USER_PROFILE: '/sys-user/profile',

        LOG_PAGE: '/sys-log/page',
        LOG_TRUNCATE: '/sys-log/truncate',

        SCHEDULE_LIST: '/scheduled-task/list',
        SCHEDULE_SWITCH: '/scheduled-task/switch',
    };

    export enum CODE {
        SUCCESS = 0,
    }

    export enum SYS_MENU_TYPE {
        DIRECTORY = 0,
        PAGE = 1,
        OPERATION = 2,
    }

    export enum ACCOUNT_STATUS {
        ACTIVE = 0,
        BANNED = -1,
    }

    export interface Res<T> {
        code: number;
        message?: string;
        data?: T;
    }

    export interface Pagi<T> {
        totalItems?: number;
        totalPages?: number;
        pageSize: number;
        page: number;
        data: T[];
    }

    export interface ValidError {
        errors?: string[];
    }

    export interface JwtToken {
        tokenType: string;
        accessToken: string;
        accessTokenExpiresInSec: number;
        refreshToken: string;
        refreshTokenExpiresInSec: number;
    }

    export interface SysRole {
        id: number;
        name: string;
        createAt: Date;
        updateAt: Date;
        menus: SysMenu[];
    }

    export interface SysPermission {
        id: number;
        name: string;
    }

    export interface SysUser {
        id: number;
        photo: string;
        nickname: string;
        username: string;
        remark: string;
        roles: SysRole[];
    }

    export interface SysMenu {
        id: number;
        name: string;
        type: number;
        icon: string;
        parentId: number;
        path: string;
        sortWeight: number;
        hidden: number;
        permissions?: SysPermission[];
        children?: SysMenu[];
    }

    export interface SysLog {
        userId: number;
        ip: string;
        url: string;
        params: string;
        requestAt: Date;
        user: SysUser;
    }

    export interface ScheduledTask {
        name: string;
        cronTime: string;
        running: boolean;
        lastExecution?: Date;
        runOnce: boolean;
    }
}
