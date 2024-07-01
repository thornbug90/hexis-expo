export const mealImages = [
  { name: "highguide", image: require("./high-guide.jpg") },
  { name: "highplate", image: require("./high-plate.jpg") },
  { name: "mediumguide", image: require("./medium-guide.jpg") },
  { name: "mediumplate", image: require("./medium-plate.jpg") },
  { name: "lowguide", image: require("./low-guide.jpg") },
  { name: "lowplate", image: require("./low-plate.jpg") },
];

export const getMealImage = (name: string) => {
  const found = mealImages.find((e) => e.name === name);
  return found ? found.image : null;
};
