import { useMemo, useState } from "react";

import type {
  Owner,
  OwnerSetupChecklistItem,
  OwnerSoundStats,
  OwnerType,
} from "../model/types";

interface OwnerWithStats {
  owner: Owner;
  stats: OwnerSoundStats;
  checklist: OwnerSetupChecklistItem[];
}

export const useOwnerFilters = (items: OwnerWithStats[]) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<OwnerType | "">("");
  const [missingFilesOnly, setMissingFilesOnly] = useState(false);

  const filteredOwners = useMemo(() => {
    return items.filter(item => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        item.owner.name.toLowerCase().includes(searchValue) ||
        Boolean(
          item.owner.extension
            ?.toLowerCase()
            .includes(searchValue)
        );

      const matchesType =
        !selectedType || item.owner.type === selectedType;

      const matchesMissingFiles =
        !missingFilesOnly || item.stats.missingFiles > 0;

      return matchesSearch && matchesType && matchesMissingFiles;
    });
  }, [items, search, selectedType, missingFilesOnly]);

  return {
    search,
    setSearch,

    selectedType,
    setSelectedType,

    missingFilesOnly,
    setMissingFilesOnly,

    filteredOwners,
  };
};