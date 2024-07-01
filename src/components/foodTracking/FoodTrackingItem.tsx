import { View, TouchableOpacity } from "react-native";
import tw from "../../lib/tw";
import FoodInfo from "./FoodTrackingItemInfo";
import ItemActions from "./FoodTrackingItemActions";
import { useEffect, useRef, useState } from "react";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import { NutriticsObject, Nutrient, Portion } from "../../generated/graphql";

type Props = {
  basketId: string;
  foodObj: NutriticsObject;
  storedSelectedPortion?: Portion;
  screen: "search" | "log";
  updateLoggedItemsBadge: Function;
  updateScreen?: Function;
  loggedFoodItems;
  navigation;
  userFoodOnly: boolean;
  refetchFoodItems: Function;
};

const FoodItem: React.FC<Props> = ({
  basketId,
  foodObj,
  storedSelectedPortion,
  screen,
  loggedFoodItems,
  updateLoggedItemsBadge,
  updateScreen = () => {},
  navigation,
  refetchFoodItems,
  userFoodOnly = false,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [selectionStyle, setSelectionStyle] = useState("");
  const [selectedPortion, setSelectedPortion] = useState<Portion>(
    storedSelectedPortion && screen == "log"
      ? storedSelectedPortion
      : foodObj.portions[0]
  );
  const previousSelectedPortionName = useRef(selectedPortion.name);
  loggedFoodItems.getLoggedItems().then((items: basket) => {
    var flag = false;

    items.map((item) => {
      if (item.foodItem.id == foodObj.id) {
        flag = true;
        if (screen == "search") setSelectionStyle("bg-background-350");
      }
      if (item.id == basketId && item.quantity != quantity) {
        setQuantity(item.quantity);
      }
    });
    if (!flag) {
      setQuantity(0);
      setSelectionStyle("");
    }
  });

  useEffect(() => {
    if (screen == "search") return;
    loggedFoodItems.getLoggedItems().then((items: basket) => {
      items.map((item, index) => {
        if (
          item.id == basketId &&
          previousSelectedPortionName.current != selectedPortion.name
        ) {
          items[index].selectedPortion = selectedPortion;
          loggedFoodItems.saveLoggedItems(items).then(() => {
            updateLoggedItemsBadge(selectedPortion.name);
            updateScreen(true);
            previousSelectedPortionName.current = selectedPortion.name;
          });
        }
      });
    });
  }, [selectedPortion]);

  useEffect(() => {
    const newSelectedPortion = foodObj.portions.find(
      (item) => item?.name === selectedPortion.name
    );
    if (newSelectedPortion) setSelectedPortion(newSelectedPortion);
  }, [foodObj]);

  const updateQuantity = (quant: number) => {
    const delta = quant - quantity;
    console.log(
      `current Quantity:${quantity} New one: ${quant} delta:${delta}`
    );
    if (delta == 0) return;
    loggedFoodItems.addLoggedItems(foodObj, selectedPortion, delta).then(() => {
      updateLoggedItemsBadge();
      updateScreen(true);
      setQuantity(quant);
    });
  };
  const addFood = (
    multiplierT = multiplier,
    selectedPortionT = selectedPortion
  ) => {
    setQuantity(quantity + multiplierT);
    loggedFoodItems
      .addLoggedItems(foodObj, selectedPortionT, multiplierT)
      .then(() => {
        updateLoggedItemsBadge();
        updateScreen(true);
      });
  };
  const removeFood = () => {
    setQuantity(0);
    loggedFoodItems.removeLoggedItems(basketId, -1).then(() => {
      updateLoggedItemsBadge();
      updateScreen(true);
    });
  };

  return (
    <TouchableOpacity
      onPress={() => {
        loggedFoodItems.goTo("FoodItemDetailsScreen", {
          foodObject: foodObj,
          multiplier: multiplier,
          quantity: quantity,
          screen: screen,
          selectedPortion: selectedPortion,
          setMultiplier: (m) => {
            setMultiplier(m);
          },
          setQuantity: updateQuantity,
          setSelectedPortion: setSelectedPortion,
          addFoodItem: addFood,
          removeFoodItem: removeFood,
          userFoodOnly: userFoodOnly,
          refetchFoodItems: refetchFoodItems,
        });
      }}
    >
      <View
        style={tw`pr-3 pl-3 pt-3 border-b border-background-300 ${selectionStyle} flex flex-row`}
      >
        <View style={tw`flex flex-none grow w-60`}>
          <FoodInfo
            id={foodObj.id}
            key={foodObj.id}
            name={foodObj.name}
            nutrients={foodObj.nutrients}
            portions={foodObj.portions}
            multiplier={multiplier}
            setMultiplier={setMultiplier}
            quantity={quantity}
            setQuantity={updateQuantity}
            screen={screen}
            selectedPortion={selectedPortion}
            setSelectedPortion={setSelectedPortion}
          ></FoodInfo>
        </View>
        <View style={tw`flex flex-none w-20 justify-center border-white`}>
          <ItemActions
            quantity={quantity}
            screen={screen}
            addFoodItem={addFood}
            removeFoodItem={() => {
              removeFood();
            }}
          ></ItemActions>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FoodItem;
