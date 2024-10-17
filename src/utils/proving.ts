// jubmoji proving with their ecda lib?
// https://github.com/cursive-team/zk12/blob/main/src/lib/client/proving.ts
// https://github.com/cursive-team/babyjubjub-ecdsa
// need to compile circom circuits in build and import to prove here

import circuit from 'circuits/target/circuits.json';
import circ from 'circomlbjs';
import snark from 'snarkjs';

console.log('zk libs', circ, snark);
console.log('ZK Circuit', circuit);

// ZK email
// feature - proving food orders e.g. groceries or delivery or irl
//
