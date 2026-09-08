import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { useAppDispatch } from "../../../app/store";

import {PageContainer} from "../../../shared/ui/PageContainer";
import {ErrorState} from "../../../shared/ui/ErrorState";
import { snackbarMessages } from "../../../shared/ui/snackbar.constants";
import { showError, showInfo, showSuccess } from "../../../shared/ui/snackbar.utils";

import {
  useCreateSoundMutation,
  useUpdateSoundMutation,
} from "../api/soundsApiSlice";

import { useSoundForm } from "../hooks/useSoundForm";
import {
  hasSoundFormErrors,
  validateSoundForm,
} from "../model/sound.validation";

import SoundBasicFields from "./SoundBasicFields";
import SoundPhoneRecorder from "./SoundPhoneRecorder";
import SoundAudioSection from "./SoundAudioSection";
import SoundStatusField from "./SoundStatusField";
import SoundFormActions from "./SoundFormActions";

import type { Owner } from "../../owners/model/types";
import type { FormState } from "../model/formTypes";
import { getRtkQueryErrorMessage } from "../../../shared/utils/getRtkQueryErrorMessage";
import { saveSoundWithAudio } from "../model/saveSoundWithAudio";
import { uploadSoundFile, removeUnusedSoundFile } from "../soundStorageApi";

interface SoundFormContentProps {
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
  const [submitting, setSubmitting] = useState(false);
  const submitInProgress = useRef(false);

  const {
    form,
    errors,
    updateForm,
    handleOwnerChange,
    handleFileChange,
    removeFile,
  } = useSoundForm({
    initialValues,
    owners,
    submitted,
  });

  const [createSound, { isLoading: creating }] = useCreateSoundMutation();
  const [updateSound, { isLoading: updating }] = useUpdateSoundMutation();

  const saving = submitting || creating || updating;
  const hasAudio = Boolean(form.audioUrl || form.file);
  const title = isNew ? "Create Sound" : "Edit Sound";

  const handleCancel = () => {
    navigate("/sounds");
  };

  const handleRecordViaPhone = () => {
    if (!dialCode) {
      return;
    }

    showInfo(
      dispatch,
      `Simulation started. Dial ${dialCode} from your phone to record this sound.`
    );
  };

  const handleFileInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const result = handleFileChange(event.target.files?.[0]);

    if (!result.ok && result.error) {
      showError(dispatch, result.error);
    }

    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitInProgress.current) return;
    setSubmitted(true);

    const currentErrors = validateSoundForm(form, true);

    if (hasSoundFormErrors(currentErrors)) {
      return;
    }

    submitInProgress.current = true;
    setSubmitting(true);

    try {
      if (!isNew && !soundId) throw new Error("Sound ID is missing");
      const warning = await saveSoundWithAudio(form, initialValues.audioUrl, {
        upload: uploadSoundFile,
        cleanup: removeUnusedSoundFile,
        save: payload => isNew
          ? createSound(payload).unwrap()
          : updateSound({ id: soundId!, payload }).unwrap(),
      });
      if (warning) showInfo(dispatch, warning);
      else showSuccess(dispatch, isNew ? snackbarMessages.soundCreated : snackbarMessages.soundUpdated);
      navigate("/sounds");
    } catch (error) {
      showError(
        dispatch,
        getRtkQueryErrorMessage(error) || snackbarMessages.uploadFailed
      );
    } finally {
      submitInProgress.current = false;
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            {title}
          </Typography>

          {error && <ErrorState message={error} />}

          <Box component="form" onSubmit={handleSubmit}>
            <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Stack spacing={2}>
              <SoundBasicFields
                form={form}
                owners={owners}
                errors={errors}
                onNameChange={value => updateForm("name", value)}
                onDescriptionChange={value =>
                  updateForm("description", value)
                }
                onTypeChange={value => updateForm("type", value)}
                onOwnerChange={handleOwnerChange}
              />

              {!isNew && dialCode && (
                <SoundPhoneRecorder
                  dialCode={dialCode}
                  onRecord={handleRecordViaPhone}
                />
              )}

              <SoundAudioSection
                form={form}
                onFileChange={handleFileInputChange}
                onRemoveFile={removeFile}
              />

              <SoundStatusField
                checked={form.isActive}
                hasAudio={hasAudio}
                onChange={checked => updateForm("isActive", checked)}
              />

              <SoundFormActions
                isNew={isNew}
                saving={saving}
                onCancel={handleCancel}
              />
            </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
