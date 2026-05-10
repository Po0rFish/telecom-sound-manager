import { useMemo, useState } from "react";

import type { Sound, SoundType } from "../model/types";
import { useDebouncedValue } from "./useDebouncedValue";

export const useSoundFilters = (
  items: Sound[],
  initialOwnerId = ""
) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<SoundType | "">("");
  const [selectedOwnerId, setSelectedOwnerId] = useState(initialOwnerId);
  const [missingAudioOnly, setMissingAudioOnly] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  const filteredSounds = useMemo(() => {
    return items.filter(sound => {
      const matchesSearch = sound.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const matchesType = !selectedType || sound.type === selectedType;

      const matchesOwner =
        !selectedOwnerId || sound.ownerId === selectedOwnerId;

      const hasAudio = Boolean(sound.audioUrl);

      const matchesAudio = !missingAudioOnly || !hasAudio;

      return (
        matchesSearch &&
        matchesType &&
        matchesOwner &&
        matchesAudio
      );
    });
  }, [
    items,
    debouncedSearch,
    selectedType,
    selectedOwnerId,
    missingAudioOnly,
  ]);

  return {
    search,
    setSearch,

    selectedType,
    setSelectedType,

    selectedOwnerId,
    setSelectedOwnerId,

    missingAudioOnly,
    setMissingAudioOnly,

    filteredSounds,
  };
};