/**
 * Mock para react-native-gesture-handler
 */

import React from 'react';

export const PanGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('PanGestureHandler', { ...props, ref });
});

export const TapGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('TapGestureHandler', { ...props, ref });
});

export const FlingGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('FlingGestureHandler', { ...props, ref });
});

export const ForceTouchGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('ForceTouchGestureHandler', { ...props, ref });
});

export const LongPressGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('LongPressGestureHandler', { ...props, ref });
});

export const PinchGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('PinchGestureHandler', { ...props, ref });
});

export const RotationGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('RotationGestureHandler', { ...props, ref });
});

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export const GestureHandlerRootView = React.forwardRef((props: any, ref: any) => {
  return React.createElement('GestureHandlerRootView', { ...props, ref });
});

export const RectButton = React.forwardRef((props: any, ref: any) => {
  return React.createElement('RectButton', { ...props, ref });
});

export const BorderlessButton = React.forwardRef((props: any, ref: any) => {
  return React.createElement('BorderlessButton', { ...props, ref });
});

export const Swipeable = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Swipeable', { ...props, ref });
});

export const DrawerLayout = React.forwardRef((props: any, ref: any) => {
  return React.createElement('DrawerLayout', { ...props, ref });
});

export const TouchableHighlight = React.forwardRef((props: any, ref: any) => {
  return React.createElement('TouchableHighlight', { ...props, ref });
});

export const TouchableWithoutFeedback = React.forwardRef((props: any, ref: any) => {
  return React.createElement('TouchableWithoutFeedback', { ...props, ref });
});

export default {
  PanGestureHandler,
  TapGestureHandler,
  FlingGestureHandler,
  ForceTouchGestureHandler,
  LongPressGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
  Directions,
  GestureHandlerRootView,
  RectButton,
  BorderlessButton,
  Swipeable,
  DrawerLayout,
  TouchableHighlight,
  TouchableWithoutFeedback,
};
