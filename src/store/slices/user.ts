import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: {
            id: 0,
            photo: '',
            username: '',
            nickname: '',
            roles: [],
        },
    },
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        },
        clearUserInfo: (state) => {
            state.userInfo = {
                id: 0,
                photo: '',
                username: '',
                nickname: '',
                roles: [],
            };
        },
    },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
