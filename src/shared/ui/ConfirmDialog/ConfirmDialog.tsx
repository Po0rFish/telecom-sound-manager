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
  readonly busy?: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  confirmText = "Confirm",
  cancelText = "Cancel",
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {cancelText}
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={busy}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
