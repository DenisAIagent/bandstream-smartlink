import { configureStore } from '@reduxjs/toolkit';
import breadcrumbsReducer from './breadcrumbsSlice';

export const store = configureStore({
  reducer: {
    breadcrumbs: breadcrumbsReducer,
  },
});

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;