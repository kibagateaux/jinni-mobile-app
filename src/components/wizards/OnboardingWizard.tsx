import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { entries } from 'lodash';

import SelectMulti from 'components/modals/SelectMultiModal';
import BaseWizardScreen from './BaseScreen';
// import { useGameContent } from 'contexts/GameContentContext';
import { track } from 'utils/logging';
import { TRACK_ONBOARDING_STAGE } from 'utils/config';
import { StatsConfig } from 'types/GameMechanics';
import { AvatarViewerDefault } from '..';

export interface OnboardingWizardProps {
    startIndex?: number;
    // screens: string[]; // expo routes
    onNext?: () => void;
    onBack?: () => void;
    onComplete: (config: object) => Promise<void>;
    backButtonStyle?: object;
    nextButtonStyle?: object;
}

const avatarStats = StatsConfig.reduce((agg, s) => ({ ...agg, [s.name]: false }), {});
const avatarMoods = {
    protective: false,
    jubilant: false,
    lazy: false,
    pensive: false,
    loving: false,
    dominant: false,
    sassy: false,
    forlorn: false,
};
const intentions = {
    'creative expression': false,
    'community living': false,
    'unleashing inner child': false,
    'achieving immortality': false,
    'sexy physique': false,
    'openness & adventures': false,
    vulnerability: false,
};

const steps = [
    // TODO move to assets/game-content/onboarding
    {
        dialogueData: {
            title: 'Welcome To Jinni',
            text: 'A self-actualization game that you play in real life. Take care of your tomogatchi (a.k.a jinni) and watch it evolve based on your actions and the data you feed it.',
        },
    },
    {
        dialogueData: {
            title: 'Customize Your Game',
            text: "Jinni is about making life fun. Everyone's life is different and they learn in different ways. Decide on your jinni's intentions, attitude, and skill tree for developing during the game to influence how it evolves over time.",
        },
    },
    {
        dialogueData: {
            title: 'What kind of attitude do you want your jinni to have?',
            text: '',
        },
        options: avatarMoods,
    },
    {
        dialogueData: {
            title: 'What are you focused on improving in your life right now?',
            text: '',
        },
        options: avatarStats,
    },
    {
        dialogueData: {
            title: 'What do you want to get out of playing Jinni?',
            text: '',
        },
        options: intentions,
    },
    {
        dialogueData: {
            title: 'You Bonded With Your Jinni',
            text: 'Now you are bestest of buddies and they will help you with majikal spells throughout your day',
        },
    },
    {
        dialogueData: {
            title: 'Kiba ❤️s You 🫵',
            text: 'Jinni is still in beta. I dream and build everything you see and want to make it the best. \n\n Please join the beta tester telegram group and give any good or bad feedback you have 🙏 \n\n Much Love, Kiba Gateaux 💋',
        },
    },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
    startIndex = 0,
    // screens,
    onNext,
    onBack,
    onComplete,
}) => {
    // const onboardingContent = useGameContent().onboarding.wizard;
    const [step, setStep] = useState(startIndex);
    const [playerSettings, setSettings] = useState({}); // :config for :AvatarViewer widget

    const changeStep = useCallback(
        (index: number) => {
            track(TRACK_ONBOARDING_STAGE, {
                currentStep: index,
                totalSteps: steps.length - 1,
                // screenName:
            });
            index < step ? onBack && onBack() : onNext && onNext();
            setStep(index);
        },
        [step, setStep, onBack, onNext],
    );

    const backStep = useCallback(() => {
        console.log('component:wizard:Onboarding:backStep', step, step - 1);
        if (step !== 0) {
            changeStep(step - 1);
        }
    }, [step, changeStep]);

    const nextStep = useCallback(() => {
        console.log('component:wizard:Onboarding:nextStep', step, onComplete);
        if (step === steps.length - 1) {
            // onComplete should close out wizard
            // TODO set loading
            onComplete(playerSettings)
                .then((res) => {
                    console.log('success saving onboarding wizard', res);
                })
                .catch((err) => {
                    console.log('error saving onboarding wizard', err);
                });
            // on .then open telegram for them to join group
            // on .catch set error and render non-wizard screen
        } else {
            changeStep(step + 1);
        }
    }, [step, playerSettings, changeStep, onComplete]);

    const onSettingSaved = useCallback(
        (options) => {
            console.log('on step saved', step, options);
            switch (step) {
                case 2:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        mood: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    break;
                case 3:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        // TODO huamn readable causing issues with widget config
                        // need to convert back to stat-
                        stats: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    break;
                case 4:
                    if (!options) {
                        console.log(
                            'component:wizard:onboarding:onSave - NO options when expected -  ',
                            step,
                        );
                        break;
                    }

                    setSettings({
                        ...playerSettings,
                        intentions: entries(options)
                            .filter(([, v]) => v)
                            .map(([k]) => k),
                    });
                    // onComplete(playerSettings); and render error instead of next slide?
                    break;
                default:
                    // no custom logic on non option
                    break;
            }
            // TODO onComplete should be called in BaseWizard and defined in here
            nextStep();
        },
        [playerSettings, step, nextStep],
    );

    const screenData = steps[step];
    console.log('component:wizard:Onboarding:render step', step, screenData);
    return screenData.options ? (
        <View style={styles.container}>
            <SelectMulti
                key={screenData.dialogueData.title}
                allowMultiple
                onClose={backStep}
                onFinalize={onSettingSaved}
                useModal={false}
                {...screenData}
            />
        </View>
    ) : (
        <BaseWizardScreen step={step} onBack={backStep} onNext={nextStep} {...screenData}>
            <View style={styles.avatarContainer}>
                <AvatarViewerDefault />
            </View>
        </BaseWizardScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'skyblue',
        height: '100%',
        width: ' 100%',
    },
    avatarContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    ctaContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
});

export default OnboardingWizard;
