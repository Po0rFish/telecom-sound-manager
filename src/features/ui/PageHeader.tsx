import type { ReactNode } from "react";

import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

interface PageHeaderProps {
  title: string;

  subtitle?: string;

  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {action}
    </Stack>
  );
}