import { useMemo, useState } from "react";

import { validateSoundFile, validateSoundForm } from "../model/sound.validation";
import { uploadSoundFile } from "../storage";
import { mapSoundFormToPayload } from "../model/mappers";
import { emptyAudioState } from "../model/sound.constants";
import type { FormState } from "../model/formTypes";
import type { Owner } from "../../owners/model/types";

interface UseSoundFormParams {
  initialValues: FormState;
  owners: Owner[];
  submitted: boolean;
}

type FileChangeResult =
  | {
    ok: true;
  }
  | {
    ok: false;
    error?: string;
  };

const revokeBlobUrl = (url?: string) => {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export const useSoundForm = ({
  initialValues,
  owners,
  submitted,
}: UseSoundFormParams) => {
  const [form, setForm] = useState<FormState>(initialValues);

  const errors = useMemo(
    () => validateSoundForm(form, submitted),
    [form, submitted]
  );

  const updateForm = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOwnerChange = (ownerId: string) => {
    const owner = owners.find(item => item.id === ownerId);

    setForm(prev => ({
      ...prev,
      ownerId,
      ownerType: owner?.type || "",
    }));
  };

  const changeFile = (
    file: File,
    extension: FormState["format"]
  ) => {
    const previewUrl = URL.createObjectURL(file);

    setForm(prev => {
      revokeBlobUrl(prev.audioUrl);

      return {
        ...prev,
        file,
        fileName: file.name,
        audioUrl: previewUrl,
        format: extension,
        removeAudio: false,
      };
    });
  };

  const handleFileChange = (file?: File): FileChangeResult => {
    if (!file) {
      return {
        ok: false,
      };
    }

    const validation = validateSoundFile(file);

    if (!validation.isValid) {
      return {
        ok: false,
        error: validation.error,
      };
    }

    changeFile(file, validation.extension);

    return {
      ok: true,
    };
  };

  const removeFile = () => {
    setForm(prev => {
      revokeBlobUrl(prev.audioUrl);

      return {
        ...prev,
        ...emptyAudioState,
      };
    });
  };

  const buildPayload = async () => {
    let uploadedAudioUrl = form.audioUrl;

    if (form.file) {
      uploadedAudioUrl = await uploadSoundFile(form.file);
    }

    if (form.removeAudio) {
      uploadedAudioUrl = undefined;
    }

    return mapSoundFormToPayload(form, uploadedAudioUrl);
  };

  return {
    form,
    errors,
    updateForm,
    handleOwnerChange,
    handleFileChange,
    removeFile,
    buildPayload,
  };
};