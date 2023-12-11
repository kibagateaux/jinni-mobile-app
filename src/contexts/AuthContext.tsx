import React, { createContext, useState, useMemo, useCallback } from 'react';

import { Avatar } from 'types/UserConfig';
import { generateIdentity, getId, getSpellBook as getSpells, saveId } from 'utils/zkpid';
import { Identity } from '@semaphore-protocol/identity';
import { useExternalServices } from './ExternalServicesContext';
import { Wallet } from 'ethers';
import { getStorage, ID_PLAYER_SLOT, ID_ANON_SLOT } from 'utils/config';

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
    const [spellbook, setSpellbook] = useState<Wallet | null>(null); // TODO siger type

    const login = useCallback(
        (id: string) => {
            setPlayer({ id });
            sentry?.setUser({ id });
            // merge anon sempahore id with spellbook id if delayedlogin
            anonId ? segment?.alias(id) : segment?.identify(id);
        },
        [anonId, sentry, segment],
    );

    useMemo(() => {
        console.log('AuthContext: set player id', player?.id);
        if (!player?.id) {
            getStorage<string>(ID_PLAYER_SLOT).then((id) => id && login(id));
        } else {
            // dont need to hydrate spellbook
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

    // start tracking anon analytics for user if not logged in
    if (anonId && !player?.id) segment?.identify(anonId.getCommitment().toString());

    /**
     * @desc Generate an anonymous Ethereum identity for the player if they dont already have one
     *        Save to local storage on the phone for later use and for authentication
     */
    const getSpellBook = () => {
        console.log('hydrate spellbook', spellbook);
        if (spellbook?.address) return spellbook;
        // blocks thread and makes app load super slow.
        // ideally lazy load when we need it to cast spells.
        // TODO add method to load and save when required and add to context
        getSpells()
            .then((w: Wallet) => {
                if (!player?.id) login(w.address);
                setSpellbook(w);
            })
            .catch((e: unknown) => sentry?.captureException(e));
    };

    return (
        <AuthContext.Provider value={{ player, anonId, spellbook, getSpellBook }}>
            {children}
        </AuthContext.Provider>
    );
};
