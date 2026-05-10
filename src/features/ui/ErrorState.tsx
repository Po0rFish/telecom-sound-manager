import { Typography } from "@mui/material";

interface ErrorStateProps {
  readonly message: string;
}

export default function ErrorState({
  message,
}: Readonly<ErrorStateProps>) {
  return (
    <Typography color="error">
      {message}
    </Typography>
  );
}