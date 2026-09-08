import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import uiReducer from "./uiSlice";
import { soundsApiSlice } from "../features/sounds/api/soundsApiSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [soundsApiSlice.reducerPath]: soundsApiSlice.reducer,
  },

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(soundsApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;