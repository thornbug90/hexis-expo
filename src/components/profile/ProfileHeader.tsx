import tw from "../../lib/tw";
import { Text, View } from "react-native";

export type ProfileHeaderProps = {
  text: string;
  children?: any;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ text, children }) => {
  return (
    <View style={tw`mb-5 pb-5 border-b border-background-300`}>
      <Text style={tw`text-white text-sm tracking-wide`}>{text}</Text>
      {children}
    </View>
  );
};

export default ProfileHeader;
