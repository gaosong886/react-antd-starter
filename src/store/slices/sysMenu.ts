import { createSlice } from '@reduxjs/toolkit';
import { SysMenu } from '../../api/types';

const initialValues: SysMenu[] = [];

export const sysMenuSlice = createSlice({
    name: 'sysMenu',
    initialState: {
        data: initialValues,
    },
    reducers: {
        setSysMenuData: (state, action) => {
            state.data = action.payload;
        },
        clearSysMenuData: (state) => {
            state.data = initialValues;
        },
    },
});

export const { setSysMenuData, clearSysMenuData } = sysMenuSlice.actions;
export default sysMenuSlice.reducer;
