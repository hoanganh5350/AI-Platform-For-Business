import { useRef } from "react";
import isEqual from "lodash/isEqual";
import { shallowEqualSafe } from "../utils/compare/shallowEqualSafe";

export function useStableValue<T>(value: T, deep: boolean = false): T {
  const ref = useRef<T>(value);
  const compare = deep ? isEqual : shallowEqualSafe;

  if (!compare(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}