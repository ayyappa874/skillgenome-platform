import * as React from "react";
import { Platform } from "react-native";
import Screen4Native from "./Screen4Native";
import Screen4Web from "./Screen4Web";

const Screen4 = (props) => {
  if (Platform.OS === 'web') {
    return <Screen4Web {...props} />;
  }
  return <Screen4Native {...props} />;
};

export default Screen4;
