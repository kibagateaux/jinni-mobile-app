/**
 * Add to React Native entry point file
 * Any polyfills here for node/browser functions
 */
import { encode as btoa, decode as atob } from 'base-64';
global.btoa = btoa;
global.atob = atob;

import { getRandomValues } from 'expo-crypto';
if (!global.crypto) global.crypto = {};
global.crypto.getRandomValues = getRandomValues;

process.version = 0; // no NodeJS version in React Native

// import 'react-native-get-random-values' // expo-crypto should preempt this
// import "@ethersproject/shims"  //for ethers.js
