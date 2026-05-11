import React from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams, useSearchParams } from "react-router-dom";

import PageLoader from "../../ui/PageLoader";
import SoundFormContent from "../components/SoundFormContent";

import {
  useGetOwnersQuery,
  useGetSoundByIdQuery,
} from "../api/adminApiSlice";

import { getRtkQueryErrorMessage } from "../../../shared/utils/getRtkQueryErrorMessage";
import { mapSoundToFormState } from "../model/mappers";
import { soundTypeOptions } from "../model/sound.constants";
import type { SoundType } from "../model/types";
import type { FormState } from "../model/formTypes";

const initialForm: FormState = {
  name: "",
  description: "",
  type: "",
  ownerId: "",
  ownerType: "",
  isActive: true,
  moh: false,
};

export default function SoundForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const initialOwnerId = searchParams.get("ownerId") || "";
  const initialSoundType = getInitialSoundType(searchParams.get("type"));

  const isNew = id === "new";
  const soundId = isNew ? undefined : id;

  const {
    data: owners = [],
    isLoading: ownersLoading,
    error: ownersError,
  } = useGetOwnersQuery();

  const {
    data: selectedSound,
    isLoading: soundLoading,
    error: soundError,
  } = useGetSoundByIdQuery(soundId ?? skipToken);

  const selectedInitialOwner = React.useMemo(() => {
    if (!initialOwnerId) {
      return undefined;
    }

    return owners.find(owner => owner.id === initialOwnerId);
  }, [owners, initialOwnerId]);

  const loading = ownersLoading || Boolean(soundId && soundLoading);

  if (loading) {
    return <PageLoader />;
  }

  if (soundId && !selectedSound) {
    return <PageLoader />;
  }

  const initialValues: FormState = selectedSound
    ? mapSoundToFormState(selectedSound)
    : {
      ...initialForm,
      type: initialSoundType,
      ownerId: selectedInitialOwner?.id || "",
      ownerType: selectedInitialOwner?.type || "",
    };
    

  const errorMessage =
    getRtkQueryErrorMessage(ownersError) ||
    getRtkQueryErrorMessage(soundError);

  const formKey =
    soundId ||
    (initialOwnerId || initialSoundType
      ? `${initialOwnerId}-${initialSoundType}`
      : "new");

  return (
    <SoundFormContent
      key={formKey}
      initialValues={initialValues}
      isNew={isNew}
      owners={owners}
      error={errorMessage}
      soundId={soundId}
      dialCode={selectedSound?.dialCode}
    />
  );
}

const getInitialSoundType = (
  value: string | null
): SoundType | "" => {
  if (!value) {
    return "";
  }

  const option = soundTypeOptions.find(
    item => item.value === value
  );

  return option?.value ? (option.value as SoundType) : "";
};