import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/user';
import menuReducer from './slices/menu';

export const store = configureStore({
    reducer: {
        user: userReducer,
        menu: menuReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
