import { Identity } from '@semaphore-protocol/identity';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { execHaloCmdRN } from '@arx-research/libhalo/api/react-native.js';
export * from './zkpid.ts';

import { debug } from './logging';
import { JubjubSignature } from 'types/GameMechanics.js';

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

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const tag = await NfcManager.getTag();
        console.log('ZK:HaLo:android NFC tag reader: ', tag);
        console.log('ZK:HaLo:android Id to sign with card: ', msg);

        const result = await execHaloCmdRN(NfcManager, command);
        console.log('ZK:HaLo:android signature response: ', result);
        return !result ? null : result;
    } catch (err) {
        console.warn('ZK:HaLo:android signing error', err);
        debug(err, { tags: { hardware: true } });
        return null;
    } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
    }
};
