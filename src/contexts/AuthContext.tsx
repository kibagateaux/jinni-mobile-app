import React, { createContext, useState, useMemo } from 'react';

import { Avatar } from 'types/UserConfig';
import {
    ID_PLAYER_SLOT,
    ID_ANON_SLOT,
    generateIdentity,
    getId,
    getSpellBook,
    saveId,
} from 'utils/zkpid';
import { Identity } from '@semaphore-protocol/identity';
import { useExternalServices } from './ExternalServicesContext';
import { Wallet } from 'ethers';
import { getStorage } from 'utils/config';

interface AuthConsumables {
    player: Avatar | null;
    anonId: Identity | null;
    spellbook: Wallet | null;
    getSpellbook: () => void;
}

export const AuthContext = createContext<AuthConsumables>({
    player: null,
    anonId: null,
    spellbook: null,
    getSpellbook: () => null,
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

    const login = (id: string) => {
        setPlayer({ id });
        // merge anon sempahore id with spellbook id if delayedlogin
        anonId ? segment?.alias(id) : segment?.identify(id);
    };

    useMemo(() => {
        if (!player?.id) {
            getStorage<string>(ID_PLAYER_SLOT).then((id) => id && login(id));
        } else {
            // dont need to hydrate spellbook
        }
    }, [player?.id]);

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
                    if (!player?.id) segment?.identify(_anon_.getCommitment().toString());
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
    const getSpellbook = () => {
        console.log('hydrate spellbook', spellbook);
        if (spellbook?.address) return spellbook;
        // blocks thread and makes app load super slow.
        // ideally lazy load when we need it to cast spells.
        // TODO add method to load and save when required and add to context
        getSpellBook()
            .then((w) => {
                if (!player?.id) login(w.address);
                setSpellbook(w);
            })
            .catch((e) => sentry?.captureException(e));
    };

    return (
        <AuthContext.Provider value={{ player, anonId, spellbook, getSpellbook }}>
            {children}
        </AuthContext.Provider>
    );
};
