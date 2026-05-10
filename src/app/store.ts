import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import uiReducer from "../features/ui/uiSlice";
import { adminApiSlice } from "../features/sounds/api/adminApiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(adminApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;