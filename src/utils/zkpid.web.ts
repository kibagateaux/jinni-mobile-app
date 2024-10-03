export * from './zkpid.ts';
import { Identity } from '@semaphore-protocol/identity';
import { execHaloCmdWeb } from '@arx-research/libhalo/api/web.js';

import { debug } from './logging';
import { JubJubSigResponse } from 'types/GameMechanics';
import { ethers } from 'ethers';

interface BrowserWalletSignResult {
    signature: string;
    address: string;
}

const signWithBrowserWallet = async (message: string): Promise<BrowserWalletSignResult | null> => {
    try {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);
            const address = await signer.getAddress();
            return { signature, address };
        } else {
            console.warn('No Ethereum wallet detected');
            return null;
        }
    } catch (error) {
        console.error('Error signing with browser wallet:', error);
        return null;
    }
};

const fallbackToWalletSignature = async (
    id: string | Identity,
): Promise<JubJubSigResponse | null> => {
    const msg = typeof id === 'string' ? id : id._commitment;
    const result = await signWithBrowserWallet(msg);
    console.log('utils:zkpid:web:wallet fallback', result);

    if (result) {
        return {
            signature: {
                ether: result.signature,
                der: '',
                raw: { v: 28, s: '', r: '' },
            },
            etherAddress: result.address,
        };
    }
    return null;
};

/** TODO figure out return types from HaLo lib
 * + add callback fn to handle succ/err
 *
 */
export const signWithId = async (id: string | Identity): Promise<JubJubSigResponse | null> => {
    console.log('utils:zkpid:web:sign anon id with majik', id, typeof id);
    // https://github.com/cursive-team/jubmoji.quest/blob/2f0ccb203d432c40d2f26410d6a695f2de4feddc/apps/jubmoji-quest/src/components/modals/ForegroundTapModal.tsx#L2
    try {
        const msg = typeof id === 'string' ? id : id._commitment;
        const command = {
            name: 'sign',
            message: msg,
            format: 'text',
            keyNo: 1,
        };

        const result = await execHaloCmdWeb(command, {
            statusCallback: (cause: string) => {
                if (cause === 'init') {
                    //   callback("Please tap the tag to the back of your smartphone and hold it...")
                    // throw Error('time');
                } else if (cause === 'retry') {
                    // callback("Something went wrong, please try to tap the tag again...")
                } else if (cause === 'scanned') {
                    // callback("Tag scanned successfully, post-processing the result...");
                } else if (cause === 'finished') {
                    // callback("Tag scanned successfully, post-processing the result...");
                } else {
                    throw cause;
                    // callback(cause)
                }
            },
        });

        console.log('utils:zkpid:web:signWithId:nfcResult: ', result);
        return result ? result : fallbackToWalletSignature(id);
    } catch (err) {
        console.warn('utils:zkpid:web signing error', err);

        debug(err, { tags: { hardware: true } });
        return fallbackToWalletSignature(id);
    }
};
