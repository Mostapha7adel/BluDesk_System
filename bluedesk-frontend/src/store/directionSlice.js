import { createSlice } from '@reduxjs/toolkit';

const getInitialDirection = () => {
  return localStorage.getItem('bluedesk-direction') || 'ltr';
};

const directionSlice = createSlice({
  name: 'direction',
  initialState: { dir: getInitialDirection() },
  reducers: {
    toggleDirection: (state) => {
      state.dir = state.dir === 'ltr' ? 'rtl' : 'ltr';
      localStorage.setItem('bluedesk-direction', state.dir);
      document.documentElement.dir = state.dir;
    },
    setDirection: (state, action) => {
      state.dir = action.payload;
      localStorage.setItem('bluedesk-direction', state.dir);
      document.documentElement.dir = state.dir;
    },
  },
});

export const { toggleDirection, setDirection } = directionSlice.actions;
export const selectDirection = (state) => state.direction.dir;
export const selectIsRtl = (state) => state.direction.dir === 'rtl';
export default directionSlice.reducer;
