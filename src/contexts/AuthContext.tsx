import React, { createContext, useState, useMemo, useCallback } from 'react';

import { Avatar } from 'types/GameMechanics';
import { generateIdentity, getId, getSpellBook as getSpells, saveId } from 'utils/zkpid';
import { Identity } from '@semaphore-protocol/identity';
import { useExternalServices } from './ExternalServicesContext';
import { Wallet } from 'ethers';
import { ID_ANON_SLOT, ID_PLAYER_SLOT, getCached } from 'utils/config';

interface AuthConsumables {
    player: Avatar | null;
    anonId: Identity | null;
    spellbook: Wallet | null;
    getSpellBook: () => void;
}

export const AuthContext = createContext<AuthConsumables>({
    player: null,
    anonId: null,
    spellbook: null,
    getSpellBook: () => null,
});

export const useAuth = (): AuthConsumables => {
    return React.useContext(AuthContext);
};

type Props = {
    children?: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const { sentry, segment } = useExternalServices();
    const [player, setPlayer] = useState<Avatar | null>(null);
    const [anonId, setAnonId] = useState<Identity | null>(null);
    const [spellbook, setSpellbook] = useState<Wallet | null>(null);

    const login = useCallback(
        (id: string) => {
            setPlayer({ id });
            sentry?.setUser({ id });
            // merge anon sempahore id with spellbook id if delayedlogin
            segment?.identify(id);
        },
        [sentry, segment],
    );

    useMemo(() => {
        console.log('AuthContext: set player id', player?.id);
        if (!player?.id) {
            getCached({ slot: ID_PLAYER_SLOT }).then((id) => id && login(id));
            // magicRug();
        } else {
            //  hydrate spellbook manually once required to prevent slow app start
        }
    }, [player?.id, login]);

    /**
     * @desc Generate an anonymous Semaphore identity for the player if they dont already have one
     *        Save to local storage on the phone for later use and for authentication
     * @DEV not needed until we do social features. Built for initial auth system before moving to spellbooks.
     */
    useMemo(() => {
        console.log('anon id generation', anonId);
        if (!anonId) {
            getId(ID_ANON_SLOT).then((id) => {
                // console.log("anon id lookup", id);
                if (!id) {
                    const _anon_ = generateIdentity();
                    // console.log("anon id save", _anon_);
                    setAnonId(_anon_);
                    saveId(ID_ANON_SLOT, _anon_);
                } else {
                    setAnonId(id as Identity);
                }
            });
        }
    }, [anonId]);

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
        <AuthContext.Provider value={{ player, anonId, spellbook, getSpellBook }}>
            {children}
        </AuthContext.Provider>
    );
};
