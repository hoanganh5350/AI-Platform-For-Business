import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { UserRole } from "../../utils/types/user";
import { ROUTES } from "../../router/constants";

type ProtectedRouteProps = {
  children: ReactElement;
  authenticator?: boolean;
  role?: UserRole[];
};

export const ProtectedRoute = ({ children, authenticator, role }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const isAuth = !!token;
  const roleUser = (localStorage.getItem("role") as UserRole) || UserRole.BUSINESS;

  if (authenticator && !isAuth) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If role is provided, user must have that role
  if (authenticator && isAuth && role && !role.includes(roleUser)) {
    // If they are admin but try to access business, or vice versa, redirect to appropriate home
    if (roleUser === UserRole.ADMIN_SYSTEM || roleUser === UserRole.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    } else {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  return children;
}