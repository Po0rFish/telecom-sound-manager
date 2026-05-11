import { Grid } from "@mui/material";

import SoundCard from "./SoundCard";

import type { Sound } from "../model/types";
import type {
  Owner,
  OwnerSetupChecklistItem,
} from "../../owners/model/types";

interface SoundCardsGridProps {
  readonly sounds: Sound[];
  readonly allSounds: Sound[];
  readonly ownerMap: Record<string, Owner>;
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onOpenRequiredSetupItem: (
    ownerId: string,
    item: OwnerSetupChecklistItem
  ) => void;
}

export default function SoundCardsGrid({
  sounds,
  allSounds,
  ownerMap,
  onEdit,
  onDelete,
  onOpenRequiredSetupItem,
}: SoundCardsGridProps) {
  return (
    <Grid container spacing={3}>
      {sounds.map(sound => {
        const owner = ownerMap[sound.ownerId];

        return (
          <Grid
            key={sound.id}
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <SoundCard
              sound={sound}
              ownerName={owner?.name || "Unknown owner"}
              ownerType={owner?.type || sound.ownerType}
              owner={owner}
              sounds={allSounds}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenRequiredSetupItem={onOpenRequiredSetupItem}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}