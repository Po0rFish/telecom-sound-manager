import type { AppDispatch }
  from "../../app/store";

import { showSnackbar } from "../../app/uiSlice";

export const showSuccess = (
  dispatch: AppDispatch,
  message: string
) => {
  dispatch(
    showSnackbar({
      message,
      severity: "success",
    })
  );
};

export const showError = (
  dispatch: AppDispatch,
  message: string
) => {
  dispatch(
    showSnackbar({
      message,
      severity: "error",
    })
  );
};

export const showInfo = (
  dispatch: AppDispatch,
  message: string
) => {
  dispatch(
    showSnackbar({
      message,
      severity: "info",
    })
  );
};