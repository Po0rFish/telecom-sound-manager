import type { ReactNode } from "react";
import { Typography } from "@mui/material";

import "./PageHeader.scss";

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <Typography variant="h4" className="page-header__title">
          {title}
        </Typography>

        {subtitle && (
          <Typography color="text.secondary" className="page-header__subtitle">
            {subtitle}
          </Typography>
        )}
      </div>

      {action && (
        <div className="page-header__action">
          {action}
        </div>
      )}
    </div>
  );
}