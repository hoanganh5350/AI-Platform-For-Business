/**
 * So sánh shallow một cách an toàn:
 * - Không phụ thuộc vào thứ tự key
 * - Xử lý null, undefined, NaN
 */
export function shallowEqualSafe<T extends Record<string, unknown>>(objA: T, objB: T): boolean {
  if (objA === objB) return true;

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;

    const valA = objA[key];
    const valB = objB[key];

    const bothNaN =
      typeof valA === "number" &&
      typeof valB === "number" &&
      isNaN(valA) &&
      isNaN(valB);

    if (valA !== valB && !bothNaN) return false;
  }

  return true;
}