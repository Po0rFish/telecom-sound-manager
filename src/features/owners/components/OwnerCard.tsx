import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import type {
  Owner,
  OwnerSetupChecklistItem,
  OwnerSoundStats,
} from "../model/types";
import { getOwnerStatusColor } from "../model/ownerSetup";

interface OwnerCardProps {
  readonly owner: Owner;
  readonly stats: OwnerSoundStats;
  readonly checklist: OwnerSetupChecklistItem[];
  readonly onViewSounds: (ownerId: string) => void;
}

const getMissingFilesColor = (
  missingFiles: number
): "warning" | "default" => {
  if (missingFiles > 0) {
    return "warning";
  }

  return "default";
};

const getSetupMessage = (stats: OwnerSoundStats) => {
  if (stats.status === "Ready") {
    return "Audio setup is complete.";
  }

  if (stats.status === "Needs audio") {
    return "Some required sound records are missing audio files.";
  }

  if (stats.status === "Incomplete") {
    return "Some required sound records have not been created yet.";
  }

  if (stats.status === "No sounds") {
    return "No sounds are assigned to this owner yet.";
  }

  return "Required sound records exist, but some are inactive.";
};

const getRequiredSetupSummary = (stats: OwnerSoundStats) => {
  return `${stats.readyItems}/${stats.requiredItems} ready`;
};

export default function OwnerCard({
  owner,
  stats,
  checklist,
  onViewSounds,
}: OwnerCardProps) {
  const remainingSetupLabels = checklist
    .filter(item => item.status !== "Ready")
    .map(item => item.label)
    .join(" • ");
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Stack
          direction="column"
          spacing={2}
          useFlexGap
          sx={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "stretch",
            },
          }}
        >
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {owner.name}
              </Typography>

              <Chip
                size="small"
                color={getOwnerStatusColor(stats.status)}
                label={stats.status}
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {owner.type} • Extension: {owner.extension || "—"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {getSetupMessage(stats)}
            </Typography>

            {remainingSetupLabels && <Typography variant="body2" color="text.secondary">
              Required setup: {remainingSetupLabels}
            </Typography>}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                rowGap: 1,
                pt: 0.5,
              }}
            >
              <Chip
                size="small"
                color={getOwnerStatusColor(stats.status)}
                label={getRequiredSetupSummary(stats)}
              />

              <Chip size="small" label={`${stats.totalSounds} sounds`} />

              <Chip
                size="small"
                color={getMissingFilesColor(stats.missingFiles)}
                label={`${stats.missingFiles} files missing`}
              />

              <Chip
                size="small"
                color="success"
                label={`${stats.activeSounds} active`}
              />

              <Chip
                size="small"
                label={`${stats.inactiveSounds} inactive`}
              />
            </Stack>

            {(stats.missingFileItems > 0 ||
              stats.notCreatedItems > 0 ||
              stats.inactiveItems > 0) && (
                <Typography variant="caption" color="text.secondary">
                  Required items: {stats.missingFileItems} missing file,{" "}
                  {stats.notCreatedItems} not created,{" "}
                  {stats.inactiveItems} inactive.
                </Typography>
              )}
          </Stack>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewSounds(owner.id)}
            sx={{
              width: "100%",
              mt: "auto",
              flexShrink: 0,
            }}
          >
            View sounds
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
