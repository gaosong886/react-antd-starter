import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
    name: 'menu',
    initialState: {
        menuInfo: [],
    },
    reducers: {
        setMenuInfo: (state, action) => {
            state.menuInfo = action.payload;
        },
        clearMenuInfo: (state) => {
            state.menuInfo = [];
        },
    },
});

export const { setMenuInfo, clearMenuInfo } = menuSlice.actions;
export default menuSlice.reducer;
