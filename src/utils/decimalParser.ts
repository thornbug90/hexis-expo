const decimalParser = (inNumber: number, decimalPosition: number = 2) => {
  if (Number.isInteger(inNumber)) return inNumber;
  return Number((inNumber ?? 0).toFixed(decimalPosition));
};

export default decimalParser;
