import { HoF, ItemIds } from 'types/GameMechanics';
import { obj } from 'types/UserConfig';
import { getStorage, ID_PLAYER_SLOT, ID_PROVIDER_IDS_SLOT, saveStorage } from 'utils/config';

export const isEquipped = async (providerId: ItemIds) => {
    const pid = await getStorage(ID_PLAYER_SLOT);
    console.log(`Inv:_oauth:${providerId}:checkStatus`, pid);
    if (!pid && !__DEV__) return 'ethereal'; // allow to interact in dev even if cant equip
    const cached = (await getStorage<obj>(ID_PROVIDER_IDS_SLOT))?.[providerId];
    console.log(`Inv:_oauth:${providerId}:checkStatus`, cached);
    // TODO could make api request to see if access_token exist on API but ID should be saved on equip
    // only relevant if logging in old account to new device.
    return cached ? 'equipped' : 'unequipped';
};

export const equip =
    (providerId: ItemIds): HoF =>
    async (promptAsync) => {
        console.log('equipping', providerId, '!!!');
        try {
            // expo-auth-session only exposes API via hooks which we cant embed in this since its a conditional call
            // should we roll our own OAuth lib or just keep this callback method?
            // Slightly complicates equip() vs no params but also enables a ton of functionality for any item
            await promptAsync!();

            // TODO send mu(syncProvideId). If call fails then login unsuccessful
            // currently doing in inventory/[item].tsx with setTimeout

            return true;
        } catch (e) {
            console.log(`Inv:_oauth:${providerId}:equip:ERR`, e);

            return false;
        }
    };

export const unequip =
    (providerId: ItemIds): HoF =>
    async (): Promise<boolean> => {
        console.log('unequipping', providerId, '!!!');

        try {
            // TODO call api to delete identity
            // should delete associated data too? fucks up game dynamics too much to delete past data that affects current state
            // have specific flow to delete past data where we wanr avatar image will be recalculated and there is cost to do so
            await saveStorage(ID_PROVIDER_IDS_SLOT, { [providerId]: null }, true);
            return true;
        } catch (e) {
            console.log(`Inv:_oauth:${providerId}:unequip:ERR`, e);
            return false;
        }
    };
