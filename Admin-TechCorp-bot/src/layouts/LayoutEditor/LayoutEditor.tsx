import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "../../router/constants"; 

type LayoutEditorProps = {
  children?: ReactNode;
};

export default function LayoutEditor({ children }: LayoutEditorProps) {
  return (
    <div>
      <nav style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
        <Link to={ROUTES.DASHBOARD} style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to={ROUTES.DASHBOARD_VIEW} style={{ marginRight: 12 }}>View</Link>
        <Link to={ROUTES.DASHBOARD_VIEW_MODEL}>Model</Link>
      </nav>
      <div style={{ padding: 16 }}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}