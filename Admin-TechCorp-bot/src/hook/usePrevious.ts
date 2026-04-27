import { useRef, useEffect } from "react";
import isEqual from "lodash/isEqual";

/**
 * Lưu lại giá trị trước đó của một biến
 */

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (!isEqual(ref.current, value)) {
      ref.current = value;
    }
  }, [value]);

  return ref.current;
}
