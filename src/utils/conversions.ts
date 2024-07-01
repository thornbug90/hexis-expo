export const convertToLbs = (weight: string) => {
  if (weight) {
    return Number(weight) * 2.20462;
  } else {
    return 0;
  }
};

export const convertToKg = (weight: string) => {
  if (weight) {
    return Number(weight) * 0.453592;
  } else {
    return 0;
  }
};

export const convertToFt = (height: string) => {
  if (height) {
    const totalInches = Number(height) * 0.393701;
    const remainderInches = Math.round(totalInches % 12);
    const feet = Math.round((totalInches - remainderInches) / 12);
    return { feet: feet, inches: remainderInches };
  } else {
    return { feet: 0, inches: 0 };
  }
};

export const convertToCm = (
  height: { feet: string; inches: string } | undefined
) => {
  if (height) {
    const feet = height.feet ? height.feet : "0";
    const inches = height.inches ? height.inches : "0";
    const totalInches = Number(feet) * 12 + Number(inches);
    const heightInCm = Number(totalInches) * 2.54;
    return heightInCm;
  } else {
    return 0;
  }
};
