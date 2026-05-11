import PhoneIcon from "@mui/icons-material/Phone";
import {
  Button,
  Stack,
  Typography,
} from "@mui/material";

interface SoundPhoneRecorderProps {
  readonly dialCode: string;
  readonly onRecord: () => void;
}

export default function SoundPhoneRecorder({
  dialCode,
  onRecord,
}: SoundPhoneRecorderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
      }}
    >
      <Typography variant="body2">
        Record from phone: <strong>{dialCode}</strong>
      </Typography>

      <Button
        variant="outlined"
        size="small"
        startIcon={<PhoneIcon />}
        onClick={onRecord}
      >
        Record via phone
      </Button>
    </Stack>
  );
}