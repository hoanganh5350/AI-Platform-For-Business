import React from "react";
import isEqual from "lodash/isEqual";
import isFunction from "lodash/isFunction";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import type { NamedExoticComponent } from "react";
import { shallowEqualSafe } from "../utils/compare/shallowEqualSafe";

// Cấu hình cho memo hóa
export interface MemoComponentOptions<P> {
  ignoredKeys?: (keyof P)[];
  shallowCompare?: boolean;
}

/**
 * HOC: Memo hóa component với so sánh props thông minh
 * - Bỏ qua props là callback
 * - Bỏ qua các key được chỉ định
 * - So sánh shallow hoặc deep
 */
export function memoComponent<P extends Record<string, unknown>>(
  Component: React.FC<P>,
  options: MemoComponentOptions<P> = {}
): NamedExoticComponent<P> {
  const { ignoredKeys = [], shallowCompare = true } = options;

  const areEqual = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
    // Bỏ qua callback props
    const prevFiltered = omitBy(prevProps, isFunction);
    const nextFiltered = omitBy(nextProps, isFunction);

    // Bỏ qua các key do người dùng chỉ định
    const finalPrev = omit(prevFiltered, ignoredKeys);
    const finalNext = omit(nextFiltered, ignoredKeys);

    // So sánh shallow hoặc deep
    return shallowCompare
      ? shallowEqualSafe(finalPrev, finalNext)
      : isEqual(finalPrev, finalNext);
  };

  return React.memo(Component, areEqual);
}
