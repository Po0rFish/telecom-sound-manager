import {
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface SoundStatusFieldProps {
  readonly checked: boolean;
  readonly hasAudio: boolean;
  readonly onChange: (checked: boolean) => void;
}

export default function SoundStatusField({
  checked,
  hasAudio,
  onChange,
}: SoundStatusFieldProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          disabled={!hasAudio}
          onChange={event => onChange(event.target.checked)}
        />
      }
      label={
        hasAudio
          ? "Active"
          : "Active unavailable without audio file"
      }
    />
  );
}