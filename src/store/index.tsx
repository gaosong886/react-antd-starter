import { configureStore } from '@reduxjs/toolkit';
import sysUserReducer from './slices/sysUser';
import sysMenuReducer from './slices/sysMenu';

export const store = configureStore({
    reducer: {
        sysUser: sysUserReducer,
        sysMenu: sysMenuReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
