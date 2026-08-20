import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

const DecodeText = ({ text, delay = 0, style }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    let frame = 0;
    const total = 18;
    let interval;

    const startDecoding = () => {
      interval = setInterval(() => {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            out += ' ';
            continue;
          }
          const reveal = frame - i * 1.3;
          if (reveal > total) {
            out += text[i];
          } else if (reveal > 0) {
            out += chars[Math.floor(Math.random() * chars.length)];
          } else {
            out += ''; // empty before revealing
          }
        }
        setDisplayText(out);
        frame++;

        if (frame > text.length * 1.3 + total) {
          setDisplayText(text);
          clearInterval(interval);
        }
      }, 28);
    };

    if (delay > 0) {
      setTimeout(startDecoding, delay);
    } else {
      startDecoding();
    }

    return () => {
      clearInterval(interval);
    };
  }, [text, delay]);

  return <Text style={style}>{displayText}</Text>;
};

export default DecodeText;
