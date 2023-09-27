import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Buffer from 'buffer';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import {execHaloCmdRN} from '@arx-research/libhalo/api/react-native.js';

export const ID_ANON_SLOT = "_anon_id"
export const PROOF_MASTER_DJINN_SLOT = "master-djinn-summoning-circle"

export const generateIdentity = (): Identity => new Identity();
export const generateIdentityWithSecret = (secret: string): Identity => new Identity(secret);

export const saveId = async (idType: string, id: Identity): Promise<void> => {
    try {
      const value = await AsyncStorage.getItem(idType);
      console.log("save id existing value!", value, value === null, id)
      if (value === null) {
        await AsyncStorage.setItem(idType, JSON.stringify(toObject(id)));
        console.log("anon id saved to storage!", idType, id)
      }
    } catch (error) {
      console.error("Store Err: ", error);
    }
};

export const getId = async (idType: string): Promise<Identity | null> => {
    const id = await AsyncStorage.getItem(idType);
    console.log("getId", idType, id);
    return id ? JSON.parse(id) : null;
}

/** TODO figure out return types from HaLo lib  */
export const signWithId = async (idType: string, ): Promise<any> => {
    try {
        const id = await getId(idType);
        if(!id) throw new Error(`No id found for ${idType}`);

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const tag = await NfcManager.getTag();
        const signatureResult = await execHaloCmdRN(NfcManager, {
            name: "sign",
            message: id.getCommitment(),
            keyNo: 1, // TODO do we want to use primary wallet for signing?
          })
        console.log("HALO signature response,", signatureResult);
        return signatureResult;
      } catch (err) {
        console.warn("HaLo error", err);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
};

// Semaphore Groups have max 1048576 members (20^²).
// TODO randomer numbers for groupIds
const groupIds = {
  "MasterDjinnGroup": 0,
  "MayaneseGroup": 1,
  "CoordiNationGroup": 2,
  "BioHackingGroup": 3,
};

// Mastrer Djinn group is all players allowed by the Master Djinn to play the game, traverse portal and bond to jinn
const groupMasterDjinn = new Group(groupIds["MasterDjinnGroup"], 18);


// helper func to format BigInts from Idenity for JSON
const toObject = (thing: object) => {
  return JSON.parse(JSON.stringify(thing, (key, value) =>
      typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
  ));
}