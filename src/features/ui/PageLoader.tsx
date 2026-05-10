import {
  Box,
  CircularProgress,
} from "@mui/material";

export default function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 8,
      }}
    >
      <CircularProgress />
    </Box>
  );
}