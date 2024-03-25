import { createSlice } from '@reduxjs/toolkit';
import { SysUser } from '~/api/types';

const initialValues: SysUser = {
    id: 0,
    photo: '',
    username: '',
    nickname: '',
    remark: '',
    roles: [],
};

export const sysUserSlice = createSlice({
    name: 'sysUser',
    initialState: {
        data: initialValues,
    },
    reducers: {
        setSysUserData: (state, action) => {
            state.data = action.payload;
        },
        clearSysUserData: (state) => {
            state.data = initialValues;
        },
    },
});

export const { setSysUserData, clearSysUserData } = sysUserSlice.actions;
export default sysUserSlice.reducer;
