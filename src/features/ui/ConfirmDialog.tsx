import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogActions>
        <Button onClick={onClose}>
          {cancelText}
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}