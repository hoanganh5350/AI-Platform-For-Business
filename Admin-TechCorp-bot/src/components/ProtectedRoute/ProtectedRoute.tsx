import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { UserRole } from "../../utils/types/user";
import { ROUTES } from "../../router/constants";

// const getCurrentUserRole = (): UserRole => {
//   return (localStorage.getItem("role") as UserRole) ?? "guest";
// };

type ProtectedRouteProps = {
  children: ReactElement;
  authenticator?: boolean;
  role?: UserRole[];
};

export const ProtectedRoute = ({ children, authenticator, role }: ProtectedRouteProps) => {
  const isAuth = true;
  const roleUser = UserRole.ADMIN;

  if (authenticator && !isAuth) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (authenticator && isAuth && role && !role.includes(roleUser)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}