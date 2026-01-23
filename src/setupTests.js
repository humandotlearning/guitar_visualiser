// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Web Audio API
window.AudioContext = jest.fn().mockImplementation(() => {
  return {
    resume: jest.fn().mockResolvedValue(),
    createGain: jest.fn().mockImplementation(() => {
      return {
        gain: {
          value: 1,
          setValueAtTime: jest.fn(),
          linearRampToValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
      };
    }),
    createOscillator: jest.fn().mockImplementation(() => {
      return {
        frequency: {
          value: 440,
          setValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      };
    }),
    destination: {},
    currentTime: 0,
  };
});

window.webkitAudioContext = window.AudioContext;
