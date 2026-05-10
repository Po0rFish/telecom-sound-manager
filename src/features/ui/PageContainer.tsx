import type { ReactNode } from "react";
import { Box } from "@mui/material";

interface PageContainerProps {
  readonly children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
      }}
    >
      {children}
    </Box>
  );
}