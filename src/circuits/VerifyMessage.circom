// msg to be concatenated with `summon:` beforehand

template SignatureVerification(msg) {
    signal input signedMessage; // The signed message from the Ethereum wallet
    signal input playerId; // The player's username
    signal input addressList[10]; // List of Ethereum addresses (up to 10 for simplicity)
    signal output isValid; // Output signal indicating validity of the signature

    // Construct the message by adding the "summon:" prefix
    // signal message;
    // message <== concat("summon:", playerId); // Concatenate "summon:" with playerId

    // Hash the message (using Keccak256)
    signal hashMsg;
    hashMsg <== sha256(msg); // Replace with appropriate hash function

    // Extract the signer address from the signed message
    signal signerAddress; // This will hold the address of the signer
    signerAddress <== ecdsaRecover(signedMessage, hashMsg); // Recover the signer address from the signed message

    // Check if the signer address is in the address list
    signal isSignerInList;
    isSignerInList <== 0; // Initialize to false
    for (var i = 0; i < 10; i++) {
        isSignerInList <== isSignerInList + (signerAddress === addressList[i] ? 1 : 0);
    }

    // The output is valid if the signer is in the list and the signature is correct
    isValid <== isSignerInList > 0 && verifySignature(signedMessage, hashMsg, signerAddress); // Ensure the signature is valid
}

template A(param1, param2) {
    signal input X;
    signal output z;
}
 template B {
    signal input a;
    signal output b;

    component subTemp = A(a, param2);
    b <== subTemp.z;
 }