import {
  Button,
  Stack,
} from "@mui/material";

interface SoundFormActionsProps {
  readonly isNew: boolean;
  readonly saving: boolean;
  readonly onCancel: () => void;
}

export default function SoundFormActions({
  isNew,
  saving,
  onCancel,
}: SoundFormActionsProps) {
  const submitLabel = saving ? "Saving..." : isNew ? "Create" : "Save";

  return (
    <Stack
      direction={{ xs: "column-reverse", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "flex-end" }}
    >
      <Button
        onClick={onCancel}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={saving}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
}