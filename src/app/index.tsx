import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { isEmpty } from 'lodash/fp';

import { useHomeConfig } from 'hooks';
// import { useAuth } from 'contexts';
import { WidgetConfig, WidgetIds, obj } from 'types/UserConfig';
import { getIconForWidget } from 'utils/rendering';
import { saveHomeConfig } from 'utils/api';
// import { getActivityData } from 'inventory/android-health-connect';

import { AvatarViewer, WidgetIcon } from 'components/index';
import DefaultAvatar from 'assets/avatars/red-yellow-egg';
import WidgetContainer from 'components/home/WidgetContainer';
import OnboardingWizard from 'components/wizards/OnboardingWizard';
import {
    STAGE_AVATAR_CONFIG,
    TRACK_ONBOARDING_STAGE,
    filterOutDefaultWidgets,
    getStorage,
    itemAbilityToWidgetConfig,
    saveStorage,
} from 'utils/config';
import { debug } from 'utils/logging';
import { magicRug } from 'utils/zkpid';

const HomeScreen = () => {
    const homeConfig = useHomeConfig();
    // const { setActiveModal } = useGameContent();
    // const { player, getSpellBook } = useAuth();
    const eggRollAngle = useSharedValue(30);
    const eggAnimatedStyles = useAnimatedStyle(() => ({
        transform: [{ rotate: `${eggRollAngle.value}deg` }],
    }));
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>([]);
    const [onboardingStage, setOnboardingStage] = useState<string>();

    useMemo(() => {
        if (isEmpty(widgetConfig) && homeConfig?.widgets) {
            setWidgetConfig(homeConfig.widgets);
        }
    }, [homeConfig, widgetConfig]);

    useMemo(async () => {
        const currentStage = await getStorage<obj>(TRACK_ONBOARDING_STAGE);
        console.log('onboarding stage', onboardingStage, currentStage);
        if (!onboardingStage && !currentStage?.[STAGE_AVATAR_CONFIG]) {
            console.log('init avatar config onboarding stage');
            setOnboardingStage(STAGE_AVATAR_CONFIG);
        }
    }, [onboardingStage]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const otherSide = eggRollAngle.value < 0 ? 30 : -30;
            eggRollAngle.value = withSpring(otherSide, {
                duration: 2000, // 4 sec side to side,
                dampingRatio: 0.4,
                stiffness: 33,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 15.58,
            });
        }, 2500);
        return () => clearInterval(intervalId);
    });

    // console.log('Home:widgi', widgetConfig);

    const saveWidgets = useCallback(
        (widgets: WidgetConfig[]) => {
            setWidgetConfig(widgets);
        },
        [setWidgetConfig],
    );

    const finalizeRenovation = useCallback(
        (widgets?: WidgetConfig[], merge: boolean = true) => {
            // TODO widgetConfig is not updated when adding/removing widgets
            saveHomeConfig({
                widgets: widgets ?? widgetConfig,
                merge,
            });
        },

        [widgetConfig],
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
        if (__DEV__) await magicRug();
        // const now = new Date();
        // const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // const startTime = oneDayAgo.toISOString(); // TODO last activity time
        // const endTime = now.toISOString();
        // await getActivityData({ startTime, endTime });
    };

    console.log('eggroll ', eggRollAngle.value);
    // console.log('home onboarding ', onboardingStage);
    if (onboardingStage === STAGE_AVATAR_CONFIG)
        return (
            <OnboardingWizard
                startIndex={0}
                onComplete={async (config) => {
                    try {
                        console.log('on avatar config wizard complete', config.stats);
                        // if(!player?.id) setActiveModal({
                        //     name: 'create-spellbook',
                        //     dialogueData: {
                        //         title: "A jinni is approaching",
                        //         text: "Wait for it to sniff you and say hi",
                        //     }
                        // });
                        // await getSpellBook();

                        // setActiveModal(undefined);
                        await Promise.all([
                            finalizeRenovation(
                                [
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
                                false,
                            ), // overwrite current config with new onboarding config
                            completeWizardStage(STAGE_AVATAR_CONFIG),
                        ]);
                    } catch (e) {
                        debug(e, { extra: { onboardingStage } });
                    }
                }}
            />
        );
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Animated.View style={[styles.avatar, eggAnimatedStyles]}>
                        <AvatarViewer uri={homeConfig?.jinniImage} SVG={DefaultAvatar} />
                    </Animated.View>
                    <Button color="purple" title="Speak Intention" onPress={onIntentionPress} />
                </View>
                <WidgetContainer
                    widgets={filterOutDefaultWidgets(widgetConfig) as WidgetConfig[]}
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
