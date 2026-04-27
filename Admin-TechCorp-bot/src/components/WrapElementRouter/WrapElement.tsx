import { ProtectedRoute } from "../../components/ProtectedRoute/ProtectedRoute";
import LayoutTrading from "../../layouts/LayoutTrading/LayoutTrading";
import MainLayout from "../../layouts/MainLayout/MainLayout";
import { ELayout } from "../../utils/types/layout";
import { UserRole } from "../../utils/types/user";
import { memo, ReactElement, useCallback } from "react";

interface TypeWrapElementProps {
  element: ReactElement;
  authenticator?: boolean;
  role?: UserRole[];
  layout?: ELayout;
}

export const WrapElement: React.MemoExoticComponent<
  (props: TypeWrapElementProps) => ReactElement
> = memo((props: TypeWrapElementProps) => {
  const { element, authenticator, role, layout } = props;
  const renderWithLayout = useCallback(() => {
    switch (layout) {
      case ELayout.MAIN_LAYOUT: {
        return <MainLayout>{element}</MainLayout>;
      }
      case ELayout.LAYOUT_TRADING_VIEW: {
        return <LayoutTrading>{element}</LayoutTrading>;
      }
      default: {
        return element;
      }
    }
  }, [element, layout]);
  return (
    <ProtectedRoute authenticator={authenticator} role={role}>
      {renderWithLayout()}
    </ProtectedRoute>
  );
});
