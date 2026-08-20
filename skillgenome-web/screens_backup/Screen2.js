import * as React from "react";
import { Platform } from "react-native";
import Screen2Native from "./Screen2Native";
import Screen2Web from "./Screen2Web";

const Screen2 = (props) => {
  if (Platform.OS === 'web') {
    return <Screen2Web {...props} />;
  }
  return <Screen2Native {...props} />;
};

export default Screen2;
