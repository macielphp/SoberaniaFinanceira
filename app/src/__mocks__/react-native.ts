/**
 * Mock para React Native
 * 
 * Este arquivo fornece mocks para os módulos do React Native
 * que causam problemas de transformação no Jest.
 */

import React from 'react';

// Mock dos componentes principais do React Native
export const View = React.forwardRef((props: any, ref: any) => {
  return React.createElement('View', { ...props, ref });
});

export const Text = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Text', { ...props, ref });
});

export const ScrollView = React.forwardRef((props: any, ref: any) => {
  return React.createElement('ScrollView', { ...props, ref });
});

export const TouchableOpacity = React.forwardRef((props: any, ref: any) => {
  return React.createElement('TouchableOpacity', { ...props, ref });
});

export const TextInput = React.forwardRef((props: any, ref: any) => {
  return React.createElement('TextInput', { ...props, ref });
});

export const Image = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Image', { ...props, ref });
});

export const FlatList = React.forwardRef((props: any, ref: any) => {
  return React.createElement('FlatList', { ...props, ref });
});

export const Modal = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Modal', { ...props, ref });
});

export const Alert = {
  alert: jest.fn(),
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 667 })),
};

export const Platform = {
  OS: 'ios',
  select: jest.fn((obj: any) => obj.ios || obj.default),
};

export const StatusBar = {
  setBarStyle: jest.fn(),
  setHidden: jest.fn(),
};

export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
};

export const Linking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
};

export const PermissionsAndroid = {
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
};

export const BackHandler = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

export const AppState = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  currentState: 'active',
};

export const NetInfo = {
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
};

export const AsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
};

export const Animated = {
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  timing: jest.fn(() => ({
    start: jest.fn(),
  })),
  View: View,
  Text: Text,
};

export const PanGestureHandler = React.forwardRef((props: any, ref: any) => {
  return React.createElement('PanGestureHandler', { ...props, ref });
});

export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

export const GestureHandlerRootView = React.forwardRef((props: any, ref: any) => {
  return React.createElement('GestureHandlerRootView', { ...props, ref });
});

// Mock para react-native-gesture-handler
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

export const ActivityIndicator = React.forwardRef((props: any, ref: any) => {
  return React.createElement('ActivityIndicator', { ...props, ref });
});

export const Switch = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Switch', { ...props, ref });
});

export const Picker = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Picker', { ...props, ref });
});

export const Slider = React.forwardRef((props: any, ref: any) => {
  return React.createElement('Slider', { ...props, ref });
});

export const DatePickerIOS = React.forwardRef((props: any, ref: any) => {
  return React.createElement('DatePickerIOS', { ...props, ref });
});

export const DatePickerAndroid = {
  open: jest.fn(() => Promise.resolve({ action: 'dateSetAction', year: 2024, month: 0, day: 1 })),
};

export const TimePickerAndroid = {
  open: jest.fn(() => Promise.resolve({ action: 'timeSetAction', hour: 12, minute: 0 })),
};

export const Vibration = {
  vibrate: jest.fn(),
  cancel: jest.fn(),
};

export const Share = {
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
};

export const Clipboard = {
  getString: jest.fn(() => Promise.resolve('')),
  setString: jest.fn(),
};

export const DeviceEventEmitter = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  emit: jest.fn(),
};

export const NativeModules = {
  RNDeviceInfo: {
    getUniqueId: jest.fn(() => Promise.resolve('mock-device-id')),
    getSystemName: jest.fn(() => Promise.resolve('iOS')),
    getSystemVersion: jest.fn(() => Promise.resolve('14.0')),
  },
};

export const NativeEventEmitter = jest.fn(() => ({
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  emit: jest.fn(),
}));

export const findNodeHandle = jest.fn(() => 1);

export const measure = jest.fn((callback) => callback(0, 0, 100, 100, 0, 0));

export const UIManager = {
  measure: jest.fn((callback) => callback(0, 0, 100, 100, 0, 0)),
  setLayoutAnimationEnabledExperimental: jest.fn(),
};

export const LayoutAnimation = {
  configureNext: jest.fn(),
  create: jest.fn(),
  Presets: {
    easeInEaseOut: {},
    linear: {},
    spring: {},
  },
};

export const InteractionManager = {
  runAfterInteractions: jest.fn((callback) => callback()),
  createInteractionHandle: jest.fn(() => 1),
  clearInteractionHandle: jest.fn(),
};

export const Easing = {
  linear: jest.fn(),
  ease: jest.fn(),
  bezier: jest.fn(),
  in: jest.fn(),
  out: jest.fn(),
  inOut: jest.fn(),
};

export const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((value) => Math.round(value)),
};

export const I18nManager = {
  isRTL: false,
  allowRTL: jest.fn(),
  forceRTL: jest.fn(),
  swapLeftAndRightInRTL: jest.fn(),
};

export const AccessibilityInfo = {
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
  setAccessibilityFocus: jest.fn(),
};

export const AppRegistry = {
  registerComponent: jest.fn(),
  getAppKeys: jest.fn(() => []),
  unmountApplicationComponentAtRootTag: jest.fn(),
};

export const LogBox = {
  ignoreLogs: jest.fn(),
  ignoreAllLogs: jest.fn(),
};

export const DevSettings = {
  addMenuItem: jest.fn(),
  reload: jest.fn(),
};

export const Systrace = {
  setEnabled: jest.fn(),
  beginAsyncEvent: jest.fn(),
  endAsyncEvent: jest.fn(),
  beginEvent: jest.fn(),
  endEvent: jest.fn(),
};

export const PerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

export const Performance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

export default {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Keyboard,
  Linking,
  PermissionsAndroid,
  BackHandler,
  AppState,
  NetInfo,
  AsyncStorage,
  Animated,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
  RectButton,
  BorderlessButton,
  Swipeable,
  DrawerLayout,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Switch,
  Picker,
  Slider,
  DatePickerIOS,
  DatePickerAndroid,
  TimePickerAndroid,
  Vibration,
  Share,
  Clipboard,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  findNodeHandle,
  measure,
  UIManager,
  LayoutAnimation,
  InteractionManager,
  Easing,
  PixelRatio,
  I18nManager,
  AccessibilityInfo,
  AppRegistry,
  LogBox,
  DevSettings,
  Systrace,
  PerformanceObserver,
  Performance,
};
