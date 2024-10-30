// import { EdwardsPoint }  from 'babyjubjub-ecdsa';
// https://github.com/cursive-team/zk12/blob/main/src/lib/client/proving.ts
// https://github.com/cursive-team/babyjubjub-ecdsa
import * as fs from 'expo-file-system';
import circ from 'circomlbjs';
import { groth16 } from 'snarkjs';
// import { EdwardsPoint } from 'babyjubjub-ecdsa';

import { getSummonMsg } from 'utils/api';
import { getStorage, PROOF_MALIKS_MAJIK_SLOT } from './config';
import { JubjubSignature, SummoningProofs } from 'types/GameMechanics';
import { hashMessage } from 'ethers/lib/utils';

console.log('zk libs', circ, groth16);

const PROVE_CIRCLE_INCLUSION_CIRCUIT_PATH = 'circuits/thing_js/thing.wasm';

interface PublicKeyPoints {
    x: string;
    y: string;
}

const getPointsForAddress = (pubkey: string): PublicKeyPoints => {
    // Validate the public key format (e.g., check length, characters)
    if (!isValidPublicKey(pubkey)) {
        throw new Error('Invalid public key format');
    }

    // Derive the curve points (x, y) from the public key algebraically
    return deriveCurvePoints(pubkey);
};

const isValidPublicKey = (pubkey: string): boolean => {
    // Implement validation logic for the public key
    return typeof pubkey === 'string' && pubkey.length === 66; // Example: Check for hex format
};
const deriveCurvePoints = (pubkey: string): PublicKeyPoints => {
    // Implement the algebraic derivation of the curve points from the public key
    const hexToBigInt = (hex: string) => BigInt(`0x${hex}`);
    const pubKeyBigInt = hexToBigInt(pubkey);

    // Assuming the public key is in the format of a hex string
    const a = 0; // Coefficient a for the elliptic curve equation
    const b = 7; // Coefficient b for the elliptic curve equation
    const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'); // The prime for secp256k1

    // Calculate y^2 = x^3 + ax + b (mod p)
    const x = pubKeyBigInt % p; // x coordinate
    const ySquared = (x ** BigInt(3) + BigInt(a) * x + BigInt(b)) % p;

    // Calculate y using the modular square root
    const y = modularSqrt(ySquared, p);

    return { x: x.toString(16), y: y.toString(16) };
};

// Function to compute the modular square root using the Tonelli-Shanks algorithm
const modularSqrt = (n: bigint, p: bigint): bigint => {
    if (n === BigInt(0)) return BigInt(0);
    if (p === BigInt(2)) return n % p;

    // Check if n is a quadratic residue modulo p
    const legendreSymbol = (n: bigint, p: bigint): number => {
        return n.modPow(p.subtract(BigInt(1)).divide(BigInt(2)), p) === BigInt(1) ? 1 : -1;
    };

    if (legendreSymbol(n, p) !== 1) throw new Error('No square root exists');

    // Tonelli-Shanks algorithm
    const s = BigInt(p - 1).trailingZeroes();
    const q = (p - BigInt(1)) >> s;

    // Find a quadratic non-residue z
    let z = BigInt(2);
    while (legendreSymbol(z, p) !== -1) z += BigInt(1);

    let m = s;
    let c = z.modPow(q, p);
    let r = n.modPow((q + BigInt(1)) >> BigInt(1), p);
    let t = n.modPow(q, p);
    // let t2i = BigInt(0);

    while (t !== BigInt(0) && t !== BigInt(1)) {
        let t2i = BigInt(1);
        let i = BigInt(0);
        while (t2i !== BigInt(1)) {
            t2i = t2i.modPow(BigInt(2), p);
            i += BigInt(1);
        }

        const b = c.modPow(BigInt(1) << (m - i - BigInt(1)), p);
        r = (r * b) % p;
        t = (t * b * b) % p;
        c = (b * b) % p;
        m = i;
    }

    return r;
};

export const proveCircleMembership = async (
    pid: string,
    sig: JubjubSignature,
    validSigners: string[],
) => {
    // TODO arx sign() already reutrns pubk, just need to find path, include it in stored values, and extract it her
    const sigs = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
    console.log('finding summoner that fits requested proof...');
    console.dir(sigs);
    const p = Object.entries(sigs || {}).find(([, /* k */ v]) => sig === v);
    console.log('summoner for proof', p);
    if (!p) return false; // signature not in storage. Cant get signer and probably not valid game state

    const [signer /* sig */] = p;
    const { r, s } = sig.raw;
    const [pubX, pubY] = getPointsForAddress(signer);
    // full hash that gets signed by summoner
    const gameCommand = hashMessage(getSummonMsg({ playerId: pid }));

    const { proof, publicSignals } = await groth16.fullProve(
        {
            // all public/private inputs to circ
            cmd: gameCommand,
            validSigners,
            r,
            s,
            pubX,
            pubY,
        },
        PROVE_CIRCLE_INCLUSION_CIRCUIT_PATH,
        'circuit_0000.zkey', // TODO zk ceremony key
    );
    console.log('utils:proving:proof:', proof);
    console.log('utils:proving:public-signals:', publicSignals);

    return proof;
};

interface ProofPathParams {
    playerId: string;
    jinniId?: string;
}

export const getProofPath = ({ playerId, jinniId }: ProofPathParams): string => {
    return (fs.documentDirectory ?? '') + jinniId
        ? `circuits/proofs/${jinniId}/${playerId}.json`
        : `circuits/proofs/${playerId}/`;
};
export const slurp = async (path: string) => JSON.parse(await fs.readAsStringAsync(path));

export const verifyCircleMembership = async (pid: string, zkp: unknown) => {
    const proofPath = getProofPath({ playerId: pid });
    // if the msg signed for the proof isnt a summoning then reject
    if (zkp.cmd === `summon:${pid}`) return false;

    // will have to be passed by the prover when sending proof
    const vKey = await slurp(proofPath + 'verification_key.json');
    const publicSignals = await slurp(proofPath + 'public.json');
    const proof = await slurp(proofPath + 'proof.json');

    const res = await groth16.verify(vKey, publicSignals, proof);

    if (res) {
        console.log('Verification OK');
    } else {
        console.log('Invalid proof');
    }
};

// const proveCircleMembershipBJJ = async (pid: string, sig: JubjubSignature, validSigners: string[]) => {
//     const sigs = await getStorage<SummoningProofs>(PROOF_MALIKS_MAJIK_SLOT);
//     console.log("finding summoner that fits requested proof...");
//     console.dir(sigs);
//     const p = Object.entries(sigs || {}).find(([k, v]) => sig === v)
//     console.log("summoner for proof", p);
//     if(!p) return false;
//     const [signer, msg] = p

//     const gameCommand = getSummonMsg({playerId: pid});

//     // TODO convert signer ETH address into points on Jubmoji and Edwards for non-keccak proof
//     // unsure how to get R or G since player is not signer of of message
//     // const T = (sig.raw.r ** -1) * R
//     // const U = -(getECDSAMessageHash(gameCommang) * sig.raw.r**-1 * G)
//     // const withEdwards = [sig.raw.s, sig.raw.v, EdwardsPoint(sig.raw.v)]
//     const withEdwards: string[] = []

//     const { proof, publicSignals } = await groth16.fullProve(
//         {
//             // all public/private inputs to circ
//             cmd: gameCommand,
//             validSigners,
//             signedMsg: withEdwards
//         },
//         PROVE_CIRCLE_INCLUSION_CIRCUIT_PATH,
//         "circuit_0000.zkey" // TODO zk cermony key
//     );
//     console.log("utils:proving:proof:", proof);
//     console.log("utils:proving:public-signals:", publicSignals);

//     return proof;
// }

// TODO ZK email
// feature - proving food orders e.g. groceries or delivery or irl
//
