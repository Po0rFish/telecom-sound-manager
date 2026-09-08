import React from "react";
import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MusicOffIcon from "@mui/icons-material/MusicOff";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type {
  Sound
} from "../model/types";
import RequiredSetupTooltip from "./RequiredSetupTooltip";
import { AudioPlayer } from "../../../shared/ui/AudioPlayer/AudioPlayer";
import type { Owner, OwnerSetupChecklistItem, OwnerType } from "../../owners/model/types";

interface SoundCardProps {
  readonly sound: Sound;
  readonly ownerName: string;
  readonly ownerType?: OwnerType;
  readonly owner?: Owner;
  readonly sounds: Sound[];
  readonly onEdit: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onOpenRequiredSetupItem: (
    ownerId: string,
    type: OwnerSetupChecklistItem
  ) => void;
}

function SoundCard({
  sound,
  ownerName,
  ownerType,
  owner,
  sounds,
  onEdit,
  onDelete,
  onOpenRequiredSetupItem,
}: SoundCardProps) {
  const hasAudio = Boolean(sound.audioUrl);
  const displayOwnerType = ownerType || sound.ownerType;

  return (
    <Card sx={{ width: "100%", p: 2 }}>
      <Stack
        direction="column"
        spacing={2}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", minWidth: 0 }}
          spacing={2}>
          <Box>
            {hasAudio ? (
              <PlayArrowIcon />
            ) : (
              <MusicOffIcon />
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {sound.name}
            </Typography>

            <Typography variant="body2" color="text.secondary" noWrap>
              {ownerName}
              {displayOwnerType ? ` • ${displayOwnerType}` : ""}
              {!hasAudio && " • No audio file"}
            </Typography>

            <RequiredSetupTooltip
              owner={owner}
              sounds={sounds}
              showCompleteMessage={false}
              onSelectItem={item => {
                if (owner) {
                  onOpenRequiredSetupItem(owner.id, item);
                }
              }}
            />
          </Box>
        </Stack>

        <Stack
          direction="row"
          sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}
          spacing={1}>
          <Chip size="small" label={sound.type} />

          {!hasAudio && (
            <Chip size="small" label="No file" color="warning" />
          )}

          <Chip
            size="small"
            color={sound.isActive ? "success" : "default"}
            label={sound.isActive ? "Active" : "Inactive"}
          />

          <IconButton aria-label={`Edit ${sound.name}`} onClick={() => onEdit(sound.id)}>
            <EditIcon />
          </IconButton>

          <IconButton aria-label={`Delete ${sound.name}`} color="error" onClick={() => onDelete(sound.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
      {sound.audioUrl && (
        <Box sx={{ mt: 2 }}>
          <AudioPlayer src={sound.audioUrl} label={`Preview ${sound.name}`} />
        </Box>
      )}
    </Card>
  );
}

export default React.memo(SoundCard);
