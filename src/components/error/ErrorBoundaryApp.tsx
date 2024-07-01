import * as React from "react";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";
import tw from "../../lib/tw";
import { LogoIcon } from "../icons/general";
import * as Sentry from "sentry-expo";

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.Native.captureException(error, errorInfo);
    // You can also log the error to an error reporting service
  }

  render() {
    // @ts-ignore
    if (this.state.hasError as boolean) {
      // You can render any custom fallback UI
      return (
        <SafeAreaView
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tw.color("background-300") },
          ]}
        >
          <View style={tw`flex-1 justify-center items-center`}>
            <View style={tw`h-12 w-12 mb-8`}>
              <LogoIcon />
            </View>
            <Text
              style={tw`text-white font-poppins-semibold text-lg text-center`}
            >
              It looks like something went wrong.
            </Text>
            <Text
              style={tw`text-white font-poppins-regular text-sm mt-4 text-center`}
            >
              We're really sorry. If this keeps happening, please contact our
              support team.
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
