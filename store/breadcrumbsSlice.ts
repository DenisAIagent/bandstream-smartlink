// store/breadcrumbsSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  path: [],
};

const breadcrumbsSlice = createSlice({
  name: 'breadcrumbs',
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
      state.path = action.payload;
    },
  },
});

export const { setBreadcrumbs } = breadcrumbsSlice.actions;
export default breadcrumbsSlice.reducer;