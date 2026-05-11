import {
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { soundTypeOptions } from "../model/sound.constants";

import type { Owner } from "../../owners/model/types";
import type { FormState } from "../model/formTypes";

interface SoundBasicFieldsProps {
  readonly form: FormState;
  readonly owners: Owner[];
  readonly errors: {
    readonly name?: string;
    readonly type?: string;
    readonly owner?: string;
  };
  readonly onNameChange: (value: string) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onTypeChange: (value: FormState["type"]) => void;
  readonly onOwnerChange: (value: string) => void;
}

export default function SoundBasicFields({
  form,
  owners,
  errors,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onOwnerChange,
}: SoundBasicFieldsProps) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Sound name"
        value={form.name}
        error={Boolean(errors.name)}
        helperText={errors.name || "Example: Main Welcome Greeting"}
        onChange={event => onNameChange(event.target.value)}
        fullWidth
      />

      <TextField
        label="Description"
        value={form.description}
        onChange={event => onDescriptionChange(event.target.value)}
        multiline
        minRows={3}
        fullWidth
      />

      <TextField
        select
        label="Sound type"
        value={form.type}
        error={Boolean(errors.type)}
        helperText={errors.type}
        onChange={event =>
          onTypeChange(event.target.value as FormState["type"])
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
        value={form.ownerId}
        error={Boolean(errors.owner)}
        helperText={errors.owner}
        onChange={event => onOwnerChange(event.target.value)}
        fullWidth
      >
        {owners.map(owner => (
          <MenuItem key={owner.id} value={owner.id}>
            {owner.name} — {owner.type}
            {owner.extension ? ` / ext. ${owner.extension}` : ""}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}