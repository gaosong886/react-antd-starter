import { JwtToken } from '~/api/types';

const TOKEN_STORAGE_KEY = 'tokenWrapper';

/**
 * 为 JwtToken 扩展创建时间属性，用于本地判断 token 是否过期
 */
interface Token extends JwtToken {
    createAt: number;
}

/**
 * 工具类，用来存取 Token，以及判断 Token 是否过期
 */
export class AuthToken {
    static get(): Token | null {
        const value = localStorage.getItem(TOKEN_STORAGE_KEY);
        return value ? (JSON.parse(value) as Token) : null;
    }

    static save(token: JwtToken) {
        // 服务端回传的过期时间单位是秒，这里也用秒做单位
        const createAt = Date.now() / 1000;
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ ...token, createAt }));
    }

    static remove() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    static isExpired(token: Token): [boolean, boolean] {
        const now = Date.now() / 1000;
        const accessTokenExpired = token.createAt + token.accessTokenExpiresInSec < now;
        const refreshTokenExpired = token.createAt + token.refreshTokenExpiresInSec < now;
        return [accessTokenExpired, refreshTokenExpired];
    }
}
