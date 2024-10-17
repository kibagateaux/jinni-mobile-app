## Circom

1. Set Up Your Environment
   Before you begin coding, ensure you have the necessary tools installed:
   Rust: Required for building Circom.
   Circom: The main library for writing circuits.
   SnarkJS: A JavaScript library for generating and verifying ZKPs.
   Run the following commands to set up your environment:
   bash
   curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
   git clone https://github.com/iden3/circom.git
   cd circom
   cargo build --release
   cargo install --path circom
   npm install -g snarkjs

2. Write Your Circuit
   Create a .circom file and define your circuit. Here’s a simple example of a circuit that hashes a private key using the Poseidon hash function:
   text
   pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template privateKeyHasher() {
signal input privateKey;
signal output publicKey;

    component poseidonComponent = Poseidon(1);
    poseidonComponent.inputs <== privateKey;
    publicKey <== poseidonComponent.out;

}

component main = privateKeyHasher();

3. Compile the Circuit
   Compile your circuit using the Circom compiler to generate the R1CS representation and WASM files:
   bash
   circom yourCircuit.circom --r1cs --wasm --sym --c

4. Generate Witness
   Create an input JSON file (e.g., input.json) containing the values for your inputs. Then, use the generated WASM file to compute the witness:
   bash
   node yourCircuit_js/generate_witness.js yourCircuit_js/yourCircuit.wasm input.json witness.wtns

5. Set Up Trusted Setup
   You will need to perform a trusted setup to generate the proving and verifying keys. This can be done using SnarkJS:
   bash
   snarkjs setup yourCircuit.r1cs pot12_final.zkey

6. Generate Proof
   With the witness and proving key, generate the proof:
   bash
   snarkjs prove pot12_final.zkey witness.wtns proof.json public.json

7. Verify Proof
   To verify the proof, use SnarkJS with the verification key generated during setup:
   bash
   snarkjs verify verification_key.json public.json proof.json

8. Integrate with Smart Contracts
   You can autogenerate a Solidity verifier contract from your circuit, which allows you to verify proofs on-chain. This is done using SnarkJS as well:
   bash
   snarkjs export solidityverifier pot12_final.zkey verifier.sol

## Baby Jubjub Curve

Curve Specifications
Curve Equation: The Baby Jubjub curve is represented by the equation:
ax^2 + y^2 = 1 + dx^2y^2

where:
Coefficient a: 168700
Coefficient d: 168696
Field Modulus:
r = 21888242871839275222246405745257275088548364400416034343698204186575808495617

Order:
n = 21888242871839275222246405745257275088614511777268538073601725287587578984328

Subgroup Cofactor: 8
Generator Point: Specific coordinates are used for cryptographic operations.
