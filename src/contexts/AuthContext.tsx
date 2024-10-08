import React, { createContext, useState, useMemo, useCallback } from 'react';

import { Avatar } from 'types/GameMechanics';
import {
    getSpellBook as getSpells,
    // getId, generateIdentity, saveId
} from 'utils/zkpid';
// import { Identity } from '@semaphore-protocol/identity';
import { useExternalServices } from './ExternalServicesContext';
import { Wallet } from 'ethers';
import {
    /* ID_ANON_SLOT, */ ID_PLAYER_SLOT,
    PROOF_MALIKS_MAJIK_SLOT,
    getStorage,
} from 'utils/config';

interface AuthConsumables {
    player: Avatar | undefined;
    isNPC: boolean;
    // anonId: Identity | undefined;
    spellbook: Wallet | undefined;
    getSpellBook: () => void;
}

export const AuthContext = createContext<AuthConsumables>({
    player: undefined,
    isNPC: true,
    // anonId: undefined,
    spellbook: undefined,
    getSpellBook: () => undefined,
});

export const useAuth = (): AuthConsumables => {
    return React.useContext(AuthContext);
};

type Props = {
    children?: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [isNPC, setIsNPC] = useState<boolean>(true);

    const { sentry, segment } = useExternalServices();
    const [player, setPlayer] = useState<Avatar | undefined>(undefined);
    // const [anonId, setAnonId] = useState<Identity | undefined>(undefined);
    const [spellbook, setSpellbook] = useState<Wallet | undefined>(undefined);

    useMemo(async () => {
        if (!player?.id) setIsNPC(true);
        const isPlayer = await getStorage<string>(PROOF_MALIKS_MAJIK_SLOT);
        if (isPlayer) setIsNPC(false);
    }, [player]);

    const login = useCallback(
        (id: string) => {
            setPlayer({ id });
            sentry?.setUser({ id });
            // merge anon sempahore id with spellbook id if delayedlogin
            if (!__DEV__) segment?.identify(id);
        },
        [sentry, segment],
    );

    useMemo(() => {
        console.log('AuthContext: set player id', player?.id);
        getStorage(ID_PLAYER_SLOT).then((s) => console.log('AuthContext: fget player id', s));
        if (!player?.id) {
            getStorage<string>(ID_PLAYER_SLOT).then((id) => id && login(id));
            // magicRug();
        } else {
            // we hydrate spellbook manually once required to prevent slow app start
        }
    }, [player?.id, login]);

    /**
     * @desc Generate an anonymous Semaphore identity for the player if they dont already have one
     *        Save to local storage on the phone for later use and for authentication
     * @DEV not needed until we do social features. Built for initial auth system before moving to spellbooks.
     */
    // useMemo(() => {
    //     console.log('anon id generation', anonId);
    //     if (!anonId) {
    //         getId(ID_ANON_SLOT).then((id) => {
    //             // console.log("anon id lookup", id);
    //             if (!id) {
    //                 const _anon_ = generateIdentity();
    //                 // console.log("anon id save", _anon_);
    //                 setAnonId(_anon_);
    //                 saveId(ID_ANON_SLOT, _anon_);
    //             } else {
    //                 setAnonId(id as Identity);
    //             }
    //         });
    //     }
    // }, [anonId]);

    /**
     * @desc Generate an anonymous Ethereum identity for the player if they dont already have one
     *        Save to local storage on the phone for later use and for authentication
     */
    const getSpellBook = useCallback(async () => {
        console.log('hydrate spellbook', spellbook);
        if (spellbook?.address) return spellbook;
        const book = await getSpells();
        if (!player?.id) login(book.address);
        setSpellbook(book);
    }, [spellbook, player, login]);

    return (
        <AuthContext.Provider value={{ isNPC, player, spellbook, getSpellBook }}>
            {children}
        </AuthContext.Provider>
    );
};
