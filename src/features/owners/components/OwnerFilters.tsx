import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { OwnerType } from "../model/types";


const ownerTypeOptions: Array<{
  value: OwnerType | "";
  label: string;
}> = [
  { value: "", label: "All owner types" },
  { value: "Company", label: "Company" },
  { value: "Department", label: "Department" },
  { value: "User", label: "User" },
  { value: "Queue", label: "Queue" },
];

interface OwnerFiltersProps {
  readonly search: string;
  readonly selectedType: OwnerType | "";
  readonly missingFilesOnly: boolean;
  readonly onSearchChange: (value: string) => void;
  readonly onTypeChange: (value: OwnerType | "") => void;
  readonly onMissingFilesOnlyChange: (value: boolean) => void;
}

export default function OwnerFilters({
  search,
  selectedType,
  missingFilesOnly,
  onSearchChange,
  onTypeChange,
  onMissingFilesOnlyChange,
}: OwnerFiltersProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField
        label="Search owners"
        value={search}
        onChange={event => onSearchChange(event.target.value)}
        fullWidth
      />

      <TextField
        select
        label="Owner type"
        value={selectedType}
        onChange={event =>
          onTypeChange(event.target.value as OwnerType | "")
        }
        fullWidth
      >
        {ownerTypeOptions.map(option => (
          <MenuItem key={option.value || "all"} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <FormControlLabel
        sx={{ minWidth: 220 }}
        control={
          <Switch
            checked={missingFilesOnly}
            onChange={event =>
              onMissingFilesOnlyChange(event.target.checked)
            }
          />
        }
        label="Missing files only"
      />
    </Stack>
  );
}