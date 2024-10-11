import { useState, useEffect } from 'react';
import { joinWaitlist } from 'utils/api';
import { getStorage, ID_JINNI_SLOT } from 'utils/config';

export const useActiveJinni = () => {
    const [jid, setJinniId] = useState<string | null>(null);

    console.log('active jinni 1', jid);
    useEffect(() => {
        if (!jid) {
            // only 1 jinni per player saved in storage
            // can fully rehydrate w/ get_home_config
            getStorage<string>(ID_JINNI_SLOT).then((localJid) => {
                if (localJid) {
                    console.log('hooks:activeJinni:saved jid', localJid);
                    setJinniId(localJid);
                    return;
                } else {
                    // TODO getPlayerJinni fallback before waitlist_npc
                    console.log('hooks:activeJinni:requesting NPC', jid);

                    // player hasnt init yet. create npc and jinn on server for use in game
                    joinWaitlist()
                        .then((newJid) => {
                            console.log('hooks:activeJinni:new jid', newJid);
                            setJinniId(newJid);
                        })
                        .catch((e) => {
                            console.log(
                                'hooks:useActiveJinni:Error creating npc for new player',
                                e,
                            );
                        });
                }
            });
        }
    }, [jid, setJinniId]);

    // TODO switchJinni(jid)
    const switchJinni = (id: string) => {
        console.log('hooks:switchJinni:', id);
        setJinniId(id);
    };
    // const switchJinni =  useCallback(
    //     (id: string) => {
    //         console.log('hooks:switchJinni:', id);
    //         setJinniId(id);
    //     },
    //     [setJinniId],
    // );

    console.log('active jinni 2', jid);
    return { jid, switchJinni };
};
