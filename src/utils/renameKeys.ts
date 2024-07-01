import { curry, keys, reduce, assoc } from "rambda";

// TODO: This function is confusing. Given it's usage in day.ts (in schema) we should improve and test it.
const renameKeys = curry((keysMap, obj) => reduce((acc: any, key: any) => assoc(keysMap[key] || key, obj[key], acc), {}, keys(obj)));

/*
I asked AI to explain it:
The code you provided is a function that takes two arguments: a map of old keys to new keys, and an object.
It returns a new object with the keys of the original object renamed according to the map.

The function is curried, which means that it can be called with one argument at a time.
The first time it is called, it returns a new function that takes the second argument.

The function uses the Ramda library to implement its logic. The keys function returns an array of the keys of an object.
The reduce function takes an array, a function, and an initial value, and returns a new value by applying the function to each element of
the array, and accumulating the results. The assoc function takes a key, a value, and an object, and returns a new object with the key and
value added.
In this case, the reduce function is used to iterate over the keys of the object, and the assoc function is used to add the new key and
value to the accumulator. The initial value of the accumulator is an empty object.

The result of the reduce function is a new object with the keys of the original object renamed according to the map.
*/
export default renameKeys;

// Here is a suggested replacement which doesn't use Ramda.
export const renameKeys2 = (keysMap: { [x: string]: string }, obj: { [x: string]: unknown }) => {
  const newObj = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    const newKey = keysMap[key] || key;
    Object.assign(newObj, { [newKey]: obj[key] });
  }
  return newObj;
};
