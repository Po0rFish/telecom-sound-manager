import { useEffect, useMemo, useState } from "react";

import { validateSoundFile, validateSoundForm } from "../model/sound.validation";
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

  useEffect(() => {
    const audioUrl = form.audioUrl;
    return () => revokeBlobUrl(audioUrl);
  }, [form.audioUrl]);

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
      return {
        ...prev,
        file,
        fileName: file.name,
        audioUrl: previewUrl,
        format: extension,
        durationSec: undefined,
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
      return {
        ...prev,
        ...emptyAudioState,
      };
    });
  };

  return {
    form,
    errors,
    updateForm,
    handleOwnerChange,
    handleFileChange,
    removeFile,
  };
};
