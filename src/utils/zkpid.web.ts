export * from './zkpid.ts';
import { Identity } from '@semaphore-protocol/identity';
import { execHaloCmdWeb } from '@arx-research/libhalo/api/web.js';

import { debug } from './logging';
import { JubjubSignature } from 'types/GameMechanics';

/** TODO figure out return types from HaLo lib
 * + add callback fn to handle succ/err
 *
 */
export const signWithId = async (id: string | Identity): Promise<JubjubSignature | null> => {
    console.log('sign anon id with majik', id, typeof id);
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
                } else {
                    // callback(cause)
                }
            },
        });

        return !result ? null : result;
    } catch (err) {
        console.warn('ZK:HaLo:web signing error', err);
        debug(err, { tags: { hardware: true } });
        return null;
    }
};
