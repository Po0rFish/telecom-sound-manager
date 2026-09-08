import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import type { SoundType } from "../model/types";
import { soundTypeOptions } from "../model/sound.constants";
import type { Owner } from "../../owners/model/types";

interface SoundFiltersProps {
  readonly search: string;
  readonly selectedType: SoundType | "";
  readonly selectedOwnerId: string;
  readonly owners: Owner[];
  readonly missingAudioOnly: boolean;
  readonly onSearchChange: (value: string) => void;
  readonly onTypeChange: (value: SoundType | "") => void;
  readonly onOwnerChange: (value: string) => void;
  readonly onMissingAudioOnlyChange: (value: boolean) => void;
}

export default function SoundFilters({
  search,
  selectedType,
  selectedOwnerId,
  owners,
  missingAudioOnly,
  onSearchChange,
  onTypeChange,
  onOwnerChange,
  onMissingAudioOnlyChange,
}: SoundFiltersProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        label="Search sounds"
        value={search}
        onChange={event => onSearchChange(event.target.value)}
        fullWidth
      />

      <TextField
        select
        label="Filter by type"
        value={selectedType}
        onChange={event =>
          onTypeChange(event.target.value as SoundType | "")
        }
        fullWidth
      >
        {soundTypeOptions.map(option => (
          <MenuItem key={option.value || "all"} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Owner"
        value={selectedOwnerId}
        onChange={event => onOwnerChange(event.target.value)}
        fullWidth
      >
        <MenuItem value="">All owners</MenuItem>

        {owners.map(owner => (
          <MenuItem key={owner.id} value={owner.id}>
            {owner.name} — {owner.type}
          </MenuItem>
        ))}
      </TextField>

      <FormControlLabel
        sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        control={
          <Switch
            checked={missingAudioOnly}
            onChange={event =>
              onMissingAudioOnlyChange(event.target.checked)
            }
          />
        }
        label="Missing files only"
      />
    </Stack>
  );
}
