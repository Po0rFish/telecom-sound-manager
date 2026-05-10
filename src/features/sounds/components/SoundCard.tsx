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
  Sound} from "../model/types";
import RequiredSetupTooltip from "./RequiredSetupTooltip";
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
    <Card
      sx={{
        width: "100%",
        borderRadius: 3,
        boxShadow: 1,
        p: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            minWidth: 0,
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: hasAudio ? "#eef2ff" : "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {hasAudio ? (
              <PlayArrowIcon sx={{ color: "#4338ca" }} />
            ) : (
              <MusicOffIcon sx={{ color: "#9ca3af" }} />
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
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
              onSelectType={type => {
                if (owner) {
                  onOpenRequiredSetupItem(owner.id, type);
                }
              }}
            />
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexShrink: 0,
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          <Chip size="small" label={sound.type} />

          {!hasAudio && (
            <Chip size="small" label="No file" color="warning" />
          )}

          <Chip
            size="small"
            color={sound.isActive ? "success" : "default"}
            label={sound.isActive ? "Active" : "Inactive"}
          />

          <IconButton onClick={() => onEdit(sound.id)}>
            <EditIcon />
          </IconButton>

          <IconButton color="error" onClick={() => onDelete(sound.id)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
}

export default React.memo(SoundCard);