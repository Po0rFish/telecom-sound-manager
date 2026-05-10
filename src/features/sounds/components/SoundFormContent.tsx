import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  useCreateSoundMutation,
  useUpdateSoundMutation,
} from "../api/adminApiSlice";
import { useAppDispatch } from "../../../app/store";
import PageContainer from "../../ui/PageContainer";
import ErrorState from "../../ui/ErrorState";
import { showError, showInfo, showSuccess } from "../../ui/snackbar.utils";
import { snackbarMessages } from "../../ui/snackbar.constants";

import { soundTypeOptions } from "../model/sound.constants";
import { useSoundForm } from "../hooks/useSoundForm";
import {
  hasSoundFormErrors,
  validateSoundForm,
} from "../model/sound.validation";
import type { FormState } from "../model/formTypes";
import type { Owner } from "../../owners/model/types";

export interface SoundFormContentProps {
  readonly initialValues: FormState;
  readonly isNew: boolean;
  readonly owners: Owner[];
  readonly error?: string;
  readonly soundId?: string;
  readonly dialCode?: string;
}

export default function SoundFormContent({
  initialValues,
  isNew,
  owners,
  error,
  soundId,
  dialCode,
}: SoundFormContentProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);

  const {
    form,
    errors,
    updateForm,
    handleOwnerChange,
    handleFileChange,
    removeFile,
    buildPayload,
  } = useSoundForm({
    initialValues,
    owners,
    submitted,
  });
  const [createSound, { isLoading: creating }] = useCreateSoundMutation();

  const [updateSound, { isLoading: updating }] = useUpdateSoundMutation();

  const saving = creating || updating;

  const hasAudio = Boolean(form.audioUrl || form.file);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const currentErrors = validateSoundForm(form, true);

    if (hasSoundFormErrors(currentErrors)) {
      return;
    }

    try {
      const payload = await buildPayload();

      if (isNew) {
        await createSound(payload).unwrap();

        showSuccess(dispatch, snackbarMessages.soundCreated);
        navigate("/sounds");

        return;
      }

      if (soundId) {
        await updateSound({
          id: soundId,
          payload,
        }).unwrap();

        showSuccess(dispatch, snackbarMessages.soundUpdated);
        navigate("/sounds");
      }
    } catch (error) {
      showError(
        dispatch,
        error instanceof Error
          ? error.message
          : snackbarMessages.uploadFailed
      );
    }
  };

  return (
    <PageContainer >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            {isNew ? "Create Sound" : "Edit Sound"}
          </Typography>

          {error && <ErrorState message={error} />}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Sound name"
                value={form.name}
                error={Boolean(errors.name)}
                helperText={errors.name || "Example: Main Welcome Greeting"}
                onChange={event => updateForm("name", event.target.value)}
                fullWidth
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={event =>
                  updateForm("description", event.target.value)
                }
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                select
                label="Sound type"
                value={form.type}
                error={Boolean(errors.type)}
                helperText={errors.type}
                onChange={event =>
                  updateForm("type", event.target.value as typeof form.type)
                }
                fullWidth
              >
                {soundTypeOptions.map(option => (
                  <MenuItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Owner"
                value={form.ownerId}
                error={Boolean(errors.owner)}
                helperText={errors.owner}
                onChange={event => handleOwnerChange(event.target.value)}
                fullWidth
              >
                {owners.map(owner => (
                  <MenuItem key={owner.id} value={owner.id}>
                    {owner.name} — {owner.type}
                    {owner.extension ? ` / ext. ${owner.extension}` : ""}
                  </MenuItem>
                ))}
              </TextField>

              {!isNew && dialCode && (
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
                    onClick={() =>
                      showInfo(
                        dispatch,
                        `Simulation started. Dial ${dialCode} from your phone to record this sound.`
                      )
                    }
                  >
                    Record via phone
                  </Button>
                </Stack>
              )}

              <Stack spacing={1}>
                <Button variant="outlined" component="label">
                  {form.audioUrl ? "Replace audio file" : "Upload audio file"}

                  <input
                    hidden
                    type="file"
                    accept=".mp3,.wav,.ogg,audio/*"
                    onChange={event => {
                      const result = handleFileChange(
                        event.target.files?.[0]
                      );

                      if (!result.ok && result.error) {
                        showError(dispatch, result.error);
                      }

                      event.target.value = "";
                    }}
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

                    <Button size="small" onClick={removeFile}>
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
                    <audio
                      controls
                      src={form.audioUrl}
                      style={{ width: "100%" }}
                    />
                  </Box>
                )}
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isActive}
                    disabled={!hasAudio}
                    onChange={event =>
                      updateForm("isActive", event.target.checked)
                    }
                  />
                }
                label={
                  hasAudio
                    ? "Active"
                    : "Active unavailable without audio file"
                }
              />

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "flex-end" }}
              >
                <Button
                  onClick={() => navigate("/sounds")}
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
                  {saving ? "Saving..." : isNew ? "Create" : "Save"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}