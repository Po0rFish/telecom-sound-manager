import { Typography } from "@mui/material";

import "./EmptyState.scss";

interface EmptyStateProps {
  readonly message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Typography color="text.secondary" className="empty-state__message">
        {message}
      </Typography>
    </div>
  );
}