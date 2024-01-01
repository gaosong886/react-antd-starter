import { API } from '../api';
import { LocalStorage } from './local-storage';

interface Token extends API.JwtToken {
    createAt: number;
}

const TOKEN_STORAGE_KEY = 'tokenWrapper';

export class AuthToken {
    static get(): Token | null {
        return LocalStorage.get<Token>(TOKEN_STORAGE_KEY);
    }

    static save(token: API.JwtToken) {
        const createAt = Date.now() / 1000;
        LocalStorage.set(TOKEN_STORAGE_KEY, { ...token, createAt });
    }

    static remove() {
        LocalStorage.remove(TOKEN_STORAGE_KEY);
    }

    static isExpired(token: Token): [boolean, boolean] {
        const now = Date.now() / 1000;
        const accessTokenExpired = token.createAt + token.accessTokenExpiresInSec < now;
        const refreshTokenExpired = token.createAt + token.refreshTokenExpiresInSec < now;

        return [accessTokenExpired, refreshTokenExpired];
    }
}
