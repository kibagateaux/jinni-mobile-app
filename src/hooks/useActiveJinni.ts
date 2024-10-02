import { useState, useCallback, useEffect } from 'react';
import { joinWaitlist } from 'utils/api';
import { getStorage, ID_JINNI_SLOT } from 'utils/config';

export const useActiveJinni = () => {
    const [jid, setJinniId] = useState<string | null>(null);

    useEffect(() => {
        if (!jid) {
            // only 1 jinni per player saved in storage
            getStorage<string>(ID_JINNI_SLOT).then((localJid) => {
                console.log('hooks:activeJinni:saved jid', localJid);
                if (localJid) {
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

    const switchJinni = useCallback(
        (id: string) => {
            setJinniId(id);
        },
        [setJinniId],
    );

    return { jid, switchJinni };
};
