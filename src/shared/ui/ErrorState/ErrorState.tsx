import { Typography } from "@mui/material";

import "./ErrorState.scss";

interface ErrorStateProps {
  readonly message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-state">
      <Typography color="error" className="error-state__message">
        {message}
      </Typography>
    </div>
  );
}