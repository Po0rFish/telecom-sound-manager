import type { ReactNode } from "react";

import "./PageContainer.scss";

interface PageContainerProps {
  readonly children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="page-container">{children}</div>;
}