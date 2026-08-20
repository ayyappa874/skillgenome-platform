import React from 'react';
import { Platform } from 'react-native';
import Screen11Native from './Screen11Native';
import Screen11Web from './Screen11Web';

const Screen11 = (props) => {
  if (Platform.OS === 'web') {
    return <Screen11Web {...props} />;
  }
  return <Screen11Native {...props} />;
};

export default Screen11;
