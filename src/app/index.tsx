import React, { useCallback, useMemo, useState } from 'react';

import { View, StyleSheet, Share, Image, Linking } from 'react-native';
import { isEmpty } from 'lodash/fp';

import { useHomeConfig } from 'hooks';
import { useAuth, useGameContent } from 'contexts';
import { WidgetConfig, WidgetIds, obj } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';

import { AvatarViewer, AvatarViewerDefault, WidgetIcon } from 'components/index';
import WidgetContainer from 'components/home/WidgetContainer';
import OnboardingWizard from 'components/wizards/OnboardingWizard';
import {
    STAGE_AVATAR_CONFIG,
    TRACK_ONBOARDING_STAGE,
    getAppConfig,
    getStorage,
    isMobile,
    itemAbilityToWidgetConfig,
    saveStorage,
} from 'utils/config';
import { debug } from 'utils/logging';
import { Button } from '@rneui/themed';
import { useActiveJinni } from 'hooks/useActiveJinni';
import { UpdateWidgetConfigParams } from 'types/api';
import ModalRenderer from 'components/modals';

const HomeScreen = () => {
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([]);
    const [onboardingStage, setOnboardingStage] = useState<string>();
    const [appReady, setAppReady] = useState<boolean>(false);

    const { jid } = useActiveJinni();
    const { player, isNPC, getSpellBook } = useAuth();
    const { activeModal, setActiveModal } = useGameContent();
    console.log('loading app....', player, appReady);
    console.log('page:home:jid', jid);

    const { config: homeConfig, allJinniConfigs, save: saveHomeConfig } = useHomeConfig();

    useMemo(async () => {
        if (player) setAppReady(true);
        if (!appReady && !player) {
            console.log('loading wallet....', player);
            getSpellBook();
        }
    }, [appReady, player, getSpellBook]);

    useMemo(() => {
        if (isEmpty(widgetConfig) && homeConfig?.widgets) {
            console.log('page:home:setInitWidgi', homeConfig.widgets);
            setWidgetConfig(homeConfig.widgets);
        }
    }, [homeConfig, widgetConfig]);
    console.log('page:home:widgi', widgetConfig);

    useMemo(async () => {
        const currentStage = await getStorage<obj>(TRACK_ONBOARDING_STAGE);
        console.log('onboarding stage', onboardingStage, currentStage);
        if (!onboardingStage && !currentStage?.[STAGE_AVATAR_CONFIG]) {
            console.log('init avatar config onboarding stage');
            setOnboardingStage(STAGE_AVATAR_CONFIG);
        }
    }, [onboardingStage]);

    // const switchi = useCallback(
    // // const switchi =
    //     (e: unknown) => {
    //         const selected = Object.entries(e).find(([, val]) => !!val);
    //         console.log("Switchi Jinni 🐉🌈", selected?.[0], selected)
    //         // if (selected) switchJinni(selected[0]); // use jid of first selected jinni
    //         setActiveModal(undefined);
    //     },
    //     [setActiveModal],
    // );

    // console.log('Home:widgi', widgetConfig);

    const saveWidgets = useCallback(
        (widgets: WidgetConfig[]) => {
            setWidgetConfig(widgets);
        },
        [setWidgetConfig],
    );

    const finalizeRenovation = useCallback(
        (updates: UpdateWidgetConfigParams) => saveHomeConfig(updates),
        [saveHomeConfig],
    );

    const completeWizardStage = useCallback(
        (stage: string) => {
            console.log('compelete wizard', stage);

            return saveStorage(TRACK_ONBOARDING_STAGE, { [stage]: true }, true, {}).then(() =>
                setOnboardingStage(undefined),
            );
        },
        [setOnboardingStage],
    );

    const finalizeOnboarding = useCallback(
        async (config: object) => {
            try {
                // if (!player?.id) {
                //     setActiveModal({
                //         name: 'create-spellbook',
                //         dialogueData: {
                //             title: 'A jinni is approaching',
                //             text: 'Wait for it to sniff you and say hi',
                //         },
                //     });
                //     await getSpellBook();
                //     setActiveModal(undefined);
                // }

                console.log('save config', player);
                if (!player?.id || !jid) {
                    throw new Error('Player NPC profile not initiated yet!');
                }

                const newConfig = await finalizeRenovation({
                    jType: 'p2p',
                    summoner: player.id,
                    merge: true,
                    widgets: [
                        ...(config.stats?.map((widgetId: string) =>
                            itemAbilityToWidgetConfig(
                                'MaliksMajik',
                                `stat-${widgetId.toLowerCase()}` as WidgetIds,
                            ),
                        ) ?? []),
                        {
                            id: 'maliksmajik-avatar-viewer',
                            provider: 'MaliksMajik',
                            routeName: 'index', // home page
                            title: 'Avatar Viewer',
                            path: '/',
                            config,
                            // They can't have registered yet so no jinni id to specify for config
                            // eventually need to link with jiini. Could do in activate_jinni but :Widget wont be there if they start from desktop flow (github/facrcaster)
                            // target_uuid: await getStorage(ID_JINNI_SLOT)
                        },
                    ],
                });
                console.log('app:home:finalizeOnboarding:saved-config', newConfig);

                if (!newConfig) {
                    // saving jinni config from onboarding failed. do not continue to home screen
                    throw new Error(
                        'Could not save settings to the Master Djinn. They have been stored locally so you dont need to fill them out again :)',
                    );
                }
                // complete onboarding only if config successfully saved on server
                await completeWizardStage(STAGE_AVATAR_CONFIG);

                Linking.openURL('https://t.me/+fkqlrBc4YYczM2Mx');
            } catch (e) {
                console.log('app:home:finalizeOnboarding:error', e);
                setActiveModal({
                    name: 'api-error',
                    dialogueData: {
                        title: 'Majiq mesesage not sent over the cosmic wire',
                        text: e as string,
                    },
                });
                debug(e, { extra: { onboardingStage: STAGE_AVATAR_CONFIG } });
                // throw(e);
            }
        },
        [player, jid, finalizeRenovation, setActiveModal, completeWizardStage],
    );

    const HomeWidget = ({ id, title, path }: WidgetConfig) => {
        return (
            <WidgetIcon
                key={id}
                widgetId={id}
                text={title}
                to={path}
                height={50}
                width={50}
                icon={getIconForWidget(id)}
            />
        );
    };

    const onIntentionPress = async () => {
        if (isMobile()) {
            await Share.share({
                title: 'Share your 🧞‍♂️ name with your friends',
                message:
                    'Here is my Jinni id. Add me to your summoning circle 😇' +
                    '\n`' +
                    player?.id +
                    '`',
            });
        } else {
            // TODO implement native flow e.g. taost w/ "copied to clipboard", FC frame, or some other desktop based UX
        }

        // const now = new Date();
        // const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // const startTime = oneDayAgo.toISOString(); // TODO last activity time
        // const endTime = now.toISOString();
        // await getActivityData({ startTime, endTime });
    };

    if (!appReady) {
        console.log('waiting for wallet....');
        return <Image source={{ uri: '/splash.png' }} />;
    }

    // console.log('home onboarding ', onboardingStage);
    // TODO abstrzct into onboarding component systemization
    if (onboardingStage === STAGE_AVATAR_CONFIG)
        return (
            <>
                <ModalRenderer />
                <OnboardingWizard startIndex={0} onComplete={finalizeOnboarding} />
            </>
        );

    if (activeModal?.name === 'select-jinni') {
        const options = Object.entries(allJinniConfigs).reduce(
            (agg, [k]) => ({
                ...agg,
                [k]: k === jid, // preselect the active jinni
            }),
            {},
        );
        return (
            <>
                <ModalRenderer options={options} />
            </>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    {!player?.id ? null : (
                        <Button
                            title={player?.id.slice(0, 18)}
                            type="clear"
                            onPress={async () => {
                                setActiveModal({ name: 'select-jinni' });
                            }}
                        />
                    )}
                    {/* TODO if not homeConfig.lastDiviTime then animated egg roll (no jinni evolution yet)
                            dont use API url bc thats actual avatar, client side option to not display actual avatar image  
                            uri = egg
                        else normal avatar viewer. with uri = /avatars/{jid}
                    */}
                    <View style={styles.avatar}>
                        {isNPC ? (
                            <AvatarViewerDefault />
                        ) : (
                            <AvatarViewer
                                uri={`${getAppConfig().API_URL}/avatars/${jid}?mode=view`}
                            />
                        )}
                    </View>

                    <Button color="blue" title="Speak Intention" onPress={onIntentionPress} />
                </View>
                <WidgetContainer
                    widgets={widgetConfig}
                    WidgetRenderer={HomeWidget}
                    saveWidgets={saveWidgets}
                    finalizeRenovation={finalizeRenovation}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarContainer: {
        flex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        margin: '10%',
    },
    avatar: {
        marginTop: 200,
    },
});

export default HomeScreen;
