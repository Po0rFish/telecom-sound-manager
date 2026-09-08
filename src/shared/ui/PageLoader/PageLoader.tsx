import { CircularProgress } from "@mui/material";

import "./PageLoader.scss";

export function PageLoader() {
  return (
    <div className="page-loader">
      <CircularProgress />
    </div>
  );
}