const generateRandomString: Function = function (
  length: number,
  randomString: string = ""
) {
  randomString += Math.random().toString(20).substr(2, length);
  if (randomString.length > length) return randomString.slice(0, length);
  return generateRandomString(length, randomString);
};
export default generateRandomString;

export const sortArrayByTime: Function = function (array: any[]) {
  return array?.sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
};
