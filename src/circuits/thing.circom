pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom"; // Include Poseidon hash function
include "../../node_modules/circomlib/circuits/babyjub.circom"; // Include BabyJubJub curve operations


// // Signature verification template
// template SignatureVerification() {
//     signal input msg; // Input message M
//     signal input signature_r; // Signature part r
//     signal input signature_s; // Signature part s
//     signal input pubKeyX; // Public key X derived from signer S
//     signal input pubKeyY; // Public key Y derived from signer S

//     // Hash the message using Poseidon
//     signal hashedMsg;
//     hashedMsg <== Poseidon([msg]);

//     // Verify signature using BabyJubJub curve
//     component verifySignature = BabyJubJubVerify();
    
//     // Connect inputs to the verification component
//     verifySignature.msg <== hashedMsg;
//     verifySignature.signature_r <== signature_r;
//     verifySignature.signature_s <== signature_s;
//     verifySignature.pubKeyX <== pubKeyX;
//     verifySignature.pubKeyY <== pubKeyY;

//     // Output whether the signature is valid (1 for valid, 0 for invalid)
//     signal output isValid;
//     isValid <== verifySignature.out;
// }

// // Main component to run the circuit
// component main { public [msg, signature_r, signature_s, pubKeyX, pubKeyY] } = SignatureVerification();

template CircleInclusion() {
    // Public inputs
    signal input cmd; // The game command to verify
    signal input validSigners[3]; // List of valid signers (fixed size)
    
    // Private inputs
    signal input signer; // The actual signer (private)
    //
    signal input signedMsg; // The signed message (private)

    // Intermediate signals
    signal msgHash; // Hash of the game command
    signal isValidSig;
    signal isValidSigner; // To check if signer is in validSigners

    // Compute the hash of the game command using Poseidon
    component poseidon = Poseidon(1); // Create a Poseidon hash component
    poseidon.inputs <== [cmd]; // Set the input for hashing
    msgHash <== poseidon.out; // Get the hashed output


    // Check if signer is one of the valid signers
    // isValidSigner <== ((signer === validSigners[0]) || (signer === validSigners[1]) || (signer === validSigners[2]));
    isValidSigner <== (signer - validSigners[0]);

    // // Verify that the signed message is indeed a signature of the game command
    isValidSig <== signedMsg - msgHash;
    // Correcting the assignment with semicolons


    // // Output constraints
    signal output proofValidity;
    // proofValidity <== AND()(NOT()(isValidSigner), NOT()(isValidSig));
    
    // if hashes are equal then they equal 0. 
    // both values must be 0 to pass. Same as NOR()(isValidSigner, isValidSig);
    proofValidity <== ((isValidSigner * isValidSig) + 1 - isValidSigner - isValidSig);
}

// // Main circuit instantiation
component main  { public [cmd, validSigners] } = CircleInclusion();