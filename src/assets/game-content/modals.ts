import { ItemAbility } from 'types/GameMechanics';

export default {
    'ability-check': {
        title: 'Your 🧞‍♂️ is doing a NAT Roll',
        text: 'Holup! Checking your skill level to perform this ability',
    },
    'ability-activate': {
        title: ({ name }: ItemAbility) => `Your 🧞‍♂️ is activating your ${name ?? ''} ability`,
        text: '',
    },
    'ability-complete': {
        title: '🧞‍♂️ majik spell succeeded',
        text: 'You have completed the task and increased your majik points',
    },
    'ability-fail': {
        title: '🧞‍♂️ skill issue!',
        text: 'You could not perform the ability at this time 🙈',
    },
    'select-multi': {
        title: ({ title }) => `Select All Options\n\n${title}`,
        text: '',
    },
};
