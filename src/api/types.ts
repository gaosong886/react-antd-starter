// 接口返回状态码
export enum ResCode {
    SUCCESS = 0,
}

// 菜单类型
export enum SysMenuType {
    // 目录
    DIRECTORY = 0,

    // 页面
    PAGE = 1,

    // 操作
    OPERATION = 2,
}

// 账号状态
export enum AccountStatus {
    ACTIVE = 0,
    BANNED = -1,
}

// 统一封装的接口返回对象，data 泛型
export interface Res<T> {
    code: number;
    message?: string;
    data?: T;
}

// 分页对象
export interface Pager<T> {
    totalItems?: number;
    totalPages?: number;
    pageSize: number;
    page: number;
    data: T[];
}

// 参数校验错误信息
export interface ValidError {
    errors?: string[];
}

// JWT
export interface JwtToken {
    tokenType: string;
    accessToken: string;
    accessTokenExpiresInSec: number;
    refreshToken: string;
    refreshTokenExpiresInSec: number;
}

// 角色
export interface SysRole {
    id: number;
    name: string;
    createAt: Date;
    updateAt: Date;
    menus: SysMenu[];
}

// 权限
export interface SysPermission {
    id: number;
    name: string;
}

// 用户信息
export interface SysUser {
    id: number;
    photo: string;
    nickname: string;
    username: string;
    remark: string;
    roles: SysRole[];
}

// 菜单
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

// 系统日志
export interface SysLog {
    userId: number;
    ip: string;
    url: string;
    params: string;
    requestAt: Date;
    user: SysUser;
}

// 定时任务
export interface ScheduledTask {
    name: string;
    cronTime: string;
    running: boolean;
    lastExecution?: Date;
    runOnce: boolean;
}
