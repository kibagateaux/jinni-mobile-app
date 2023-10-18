import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Buffer from 'buffer';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import {execHaloCmdRN} from '@arx-research/libhalo/api/react-native.js';

export const ID_ANON_SLOT = "_anon_id"
export const PROOF_MALIKS_MAJIK_SLOT = "MaliksMajik"

export const generateIdentity = (): Identity => new Identity();
export const generateIdentityWithSecret = (secret: string): Identity => new Identity(secret);

export const saveId = async (idType: string, id: any): Promise<void> => {
    try {
      const value = await AsyncStorage.getItem(idType);
      // console.log("save id existing value!", value, value === null, id)
      
      // @dev INVARIANT: MUST NOT OVERWRITE OR DELTE ZK IDs
      if (value === null) {
        await AsyncStorage.setItem(idType, JSON.stringify(toObject(id)));
        // console.log("anon id saved to storage!", idType, id)
      }
    } catch (error) {
      console.error("Store Err: ", error);
    }
};

export const getId = async (idType: string): Promise<Identity | null> => {
    const id = await AsyncStorage.getItem(idType);
    // console.log("getId", idType, id);
    return id ? JSON.parse(id) : null;
}

export const _delete_id = async (idType: string): Promise<void> => {
  console.log("node env", process.env.NODE_ENV);
  console.log("\n\n\nZK: DELETING ID!!!! ONLY AVAILABKLE IN DEVELOPMENT!!!! ENSURE THIS IS INTENDED BEHAVIOUR!!!!!\n\n\n");
  if(!__DEV__) throw Error("CANNOT DELETE ZK IDs");
  await AsyncStorage.setItem(idType, '');
}

/** TODO figure out return types from HaLo lib  */
export const signWithId = async (idType: string, ): Promise<any | null> => {
    const id = await getId(idType);
    if(!id) throw new Error(`ZK:HaLo: No id found for ${idType}`);

    try {
        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const tag = await NfcManager.getTag();
        console.log("ZK:HaLo: NFC tag reader: ", tag);
        console.log("ZK:HaLo: Id to sign with card: ", id._commitment);
        const result = await execHaloCmdRN(NfcManager, {
            name: "sign",
            message: id._commitment,
            format: "text",
            keyNo: 1, // TODO do we want to use primary wallet for signing?
        });
        console.log("ZK:HaLo: signature response: ", result);
        return !result ? null : result;
      } catch (err) {
        console.warn("ZK:HaLo: signing error", err);
        return null;
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
};

// Semaphore Groups have max 1048576 members (20^²).
// TODO randomer numbers for groupIds
const groupIds = {
  "MaliksMajikGroup": 0,
  "MayaneseGroup": 1,
  "CoordiNationGroup": 2,
  "BioHackingGroup": 3,
};

// Mastrer Djinn group is all players blesswith Malik's Majik to play the game, traverse portal and bond to jinn
const groupMaliksMajik = new Group(groupIds["MaliksMajikGroup"], 18);


// helper func to format BigInts from Idenity for JSON
const toObject = (thing: object) => {
  return JSON.parse(JSON.stringify(thing, (key, value) =>
      typeof value === 'bigint' // || 'bignumber' || 'number'
          ? value.toString()
          : value // return everything else unchanged
  ));
}