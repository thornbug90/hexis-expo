export const decimalValidate = (
  text: string,
  setState: React.Dispatch<React.SetStateAction<string>>
) => {
  const regex = /^\d*\.?\d*$/;
  if (text.match(regex)) {
    const decimalCount = text.split(".").length - 1;
    if (decimalCount <= 1) {
      setState(text);
    }
  }
};
