import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import type { ChangeEvent } from "react";
import type { FormState } from "../model/formTypes";
import { AudioPlayer } from "../../../shared/ui/AudioPlayer/AudioPlayer";

interface SoundAudioSectionProps {
  readonly form: FormState;
  readonly onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onRemoveFile: () => void;
}

export default function SoundAudioSection({
  form,
  onFileChange,
  onRemoveFile,
}: SoundAudioSectionProps) {
  const uploadButtonLabel = form.audioUrl
    ? "Replace audio file"
    : "Upload audio file";

  return (
    <Stack spacing={1}>
      <Button variant="outlined" component="label">
        {uploadButtonLabel}

        <input
          hidden
          type="file"
          accept=".mp3,.wav,.ogg,audio/*"
          onChange={onFileChange}
        />
      </Button>

      {form.fileName ? (
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
          <Typography variant="body2" color="text.secondary">
            {form.file ? "New file selected:" : "Current file:"}{" "}
            {form.fileName}
          </Typography>

          <Button size="small" onClick={onRemoveFile}>
            Remove
          </Button>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No audio file attached. This sound will be saved as inactive draft.
        </Typography>
      )}

      {form.audioUrl && (
        <Box>
          <AudioPlayer src={form.audioUrl} label={`Preview ${form.name || "audio"}`} />
        </Box>
      )}
    </Stack>
  );
}
