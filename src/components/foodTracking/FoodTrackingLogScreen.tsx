import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import useFoodLog from "../../hooks/useFoodLog";
import tw from "../../lib/tw";
import { basket } from "../../navigation/primary/screens/PrimaryStack_FoodTrackingScreen";
import generateRandomString from "../../utils/generateRandomString";
import { CancelIcon } from "../icons/general";
import Loading from "../shared/LoadingScreen";
import FoodItem from "./FoodTrackingItem";
import SearchBox from "./FoodTrackingSearchBox";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = {
  mealName: string;
  goBack: Function;
  route;
  navigation;
};
const Log: React.FC<Props> = ({ route, navigation }) => {
  const [loggedItems, setLoggedItems] = useState<basket>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [processing, setProcessing] = useState(true);
  const loggedItemsRef = useRef<basket>();
  const { data: foodLog, loading: remoteLoading } = useFoodLog(
    route.params.loggedItems.mealVerification
  );

  route.params.loggedItems.getLoggedItems().then((items: basket) => {
    if (JSON.stringify(loggedItemsRef.current) !== JSON.stringify(items)) {
      loggedItemsRef.current = items;

      setLoggedItems(JSON.parse(JSON.stringify(items)));
    }
    setLocalLoading(false);
  });

  useEffect(() => {
    if (
      !localLoading &&
      !remoteLoading &&
      loggedItems.length < 1 &&
      foodLog?.foodObjects.length > 0
    ) {
      const newBasket: basket = [];
      for (let i in foodLog.foodObjects) {
        newBasket.push({
          //@ts-ignore
          id: generateRandomString(20),
          foodItem: foodLog.foodObjects[i],
          quantity: foodLog.quantities[i],
          selectedPortion: foodLog.portions[i],
        });
      }

      route.params.loggedItems.saveLoggedItems(newBasket).then(() => {
        setLoggedItems(JSON.parse(JSON.stringify(newBasket)));
        route.params.loggedItems.goTo("LogScreen");
        route.params.updateLoggedItemsBadge();
        setProcessing(false);
      });
    }
  }, [foodLog, localLoading]);

  if (!localLoading && !remoteLoading && processing == true) {
    setProcessing(false);
  }

  return (
    <View style={tw`${processing ? "justify-center flex-auto" : ""}`}>
      {processing ? (
        <Loading />
      ) : (
        <KeyboardAwareScrollView>
          {loggedItems.map((item) => {
            return (
              <FoodItem
                key={item.id}
                basketId={item.id}
                foodObj={item.foodItem}
                storedSelectedPortion={
                  item.selectedPortion ? item.selectedPortion : undefined
                }
                screen={"log"}
                loggedFoodItems={route.params.loggedItems}
                updateLoggedItemsBadge={route.params.updateLoggedItemsBadge}
                updateScreen={setProcessing}
                navigation={navigation}
              ></FoodItem>
            );
          })}
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default Log;
