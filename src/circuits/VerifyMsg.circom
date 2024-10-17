pragma circom 2.0.0;

include "circomlib/poseidon.circom"; // Include Poseidon hash function
include "circomlib/babyjubjub.circom"; // Include BabyJubJub curve operations

// Signature verification template
template SignatureVerification() {
    signal input msg; // Input message M
    signal input signedMsg; // Signed message (signature)

    // Hash the message using Poseidon
    // TODO check hash function used in ETH. see if zk friendly
    signal hashedMsg;
    hashedMsg <== Poseidon([msg]);

    // Derive signer from the signed message
    signal signerX; // X coordinate of derived signer
    signal signerY; // Y coordinate of derived signer

    // Assuming signedMsg is a valid signature, we extract coordinates
    // Here, we assume signedMsg is structured as follows:
    // signedMsg = (r, s) where r is derived from msg and s is derived from private key
    signal r; 
    signal s;

    r <== signedMsg[0]; // Extract r from signedMsg
    s <== signedMsg[1]; // Extract s from signedMsg

    // Verify signature using BabyJubJub curve
    component verifySignature = BabyJubJubVerify();

    // Connect inputs to the verification component
    verifySignature.msg <== hashedMsg;
    verifySignature.signature_r <== r;
    verifySignature.signature_s <== s;
    // TODO extract v from last byte 

    // Output whether the signature is valid (1 for valid, 0 for invalid)
    signal output isValid;
    
    isValid <== verifySignature.out;

    // If valid, derive signer coordinates
    if (isValid === 1) {
        signerX <== r;  // Example logic for deriving signerX (customize as needed)
        signerY <== s;  // Example logic for deriving signerY (customize as needed)
    } else {
        signerX <== 0;  // Default value if not valid
        signerY <== 0;  // Default value if not valid
    }
}

// Main component to run the circuit
component main { public [msg, signedMsg] } = SignatureVerification();