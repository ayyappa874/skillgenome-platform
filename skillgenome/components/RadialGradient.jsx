
import React from 'react';
import SafeLinearGradient from './SafeLinearGradient';

const RadialGradient = ({ colors = [], style, children }) => {
  return (
    <SafeLinearGradient colors={colors} style={style} start={[0.5, 0]} end={[0.5, 1]}>
      {children}
    </SafeLinearGradient>
  );
};

export default RadialGradient;
