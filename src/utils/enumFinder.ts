export const findEnumItem = <T extends Record<string, string | number>>(ENUM_LIST: T, value: string | number): keyof T | undefined => {
  const itemIdx = Object.values(ENUM_LIST).indexOf(value);

  if (itemIdx !== -1) {
    return Object.keys(ENUM_LIST)[itemIdx];
  }

  return undefined; // No match found
};
