import '@testing-library/jest-native/extend-expect';

// Mock do Buffer se não estiver disponível
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
} 