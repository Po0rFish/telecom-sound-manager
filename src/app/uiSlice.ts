import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
type SnackbarSeverity =
  | "success"
  | "error"
  | "warning"
  | "info";

interface UiState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: SnackbarSeverity;
}

const initialState: UiState = {
  snackbarOpen: false,
  snackbarMessage: "",
  snackbarSeverity: "info",
};

const uiSlice = createSlice({
  name: "ui",

  initialState,

  reducers: {
    showSnackbar(
      state,
      action: PayloadAction<{
        message: string;
        severity?: SnackbarSeverity;
      }>
    ) {
      state.snackbarOpen = true;

      state.snackbarMessage =
        action.payload.message;

      state.snackbarSeverity =
        action.payload.severity || "info";
    },

    hideSnackbar(state) {
      state.snackbarOpen = false;
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;