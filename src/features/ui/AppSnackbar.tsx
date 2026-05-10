import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { useAppDispatch, useAppSelector }
  from "../../app/store";

import { hideSnackbar } from "./uiSlice";

export default function AppSnackbar() {
  const dispatch = useAppDispatch();

  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = useAppSelector(state => state.ui);

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      <Alert
        severity={snackbarSeverity}
        variant="filled"
        onClose={() => dispatch(hideSnackbar())}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
}