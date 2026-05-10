import { Typography } from "@mui/material";

interface EmptyStateProps {
  readonly message: string;
}

export default function EmptyState({
  message,
}: Readonly<EmptyStateProps>) {
  return (
    <Typography color="text.secondary">
      {message}
    </Typography>
  );
}