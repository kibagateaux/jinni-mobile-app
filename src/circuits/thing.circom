pragma circom 2.0.0;
include "../../node_modules/circomlib/circuits/poseidon.circom";

template privateKeyHasher() {
  signal input privateKey;
  signal output publicKey;

  component poseidonComponent = Poseidon(1);
  poseidonComponent.inputs <== privateKey;
  publicKey <== poseidonComponent.out;
}

component main = privateKeyHasher();