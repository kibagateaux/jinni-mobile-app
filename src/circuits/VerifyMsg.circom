// https://github.com/cursive-team/babyjubjub-ecdsa/blob/main/packages/circuits/baby-jubjub-ecdsa/pubkey_membership.circom

include "ecc.circom"; // Include elliptic curve functions

template SignatureVerification() {
    signal input msg; // "summon:{playerId}"
    signal input playerId; // The player's username (playerId)
    signal input signature; // The ECDSA signature
    signal input pubKeyX; // Public key X coordinate
    signal input pubKeyY; // Public key Y coordinate

    signal output isValid; // Output signal indicating validity of signature

    // Construct the message by adding the "summon:" prefix
    // signal message;
    // message <== concat('summon:', playerId); // Concatenate "summon:" with playerId

    // Hash the message (using Keccak256)
    signal hashMsg;
    hashMsg <== sha256(msg); // Replace with appropriate hash function

    // Verify the signature using elliptic curve functions
    component ecdsa = ECDSAVerify();
    ecdsa.message <== hashMsg;
    ecdsa.signature <== signature;
    ecdsa.pubKeyX <== pubKeyX;
    ecdsa.pubKeyY <== pubKeyY;

    isValid <== ecdsa.isValid; // Set output based on verification
}

component main = SignatureVerification();