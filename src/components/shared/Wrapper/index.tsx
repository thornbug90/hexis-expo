import { SafeAreaView, RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import tw from "../../../lib/tw";

const Wrapper: React.FC<any> = ({
  scrollEnabled,
  livegraph,
  children,
  refreshing = false,
  onRefresh = () => {},
  addEditWorkout,
  padding = true,
}) => {
  return (
    <SafeAreaView style={tw`flex-1`}>
      <KeyboardAwareScrollView
        scrollEnabled={scrollEnabled}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: livegraph || addEditWorkout || !padding ? 0 : 32,
          marginTop: addEditWorkout ? 0 : 0,
        }}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Wrapper;
