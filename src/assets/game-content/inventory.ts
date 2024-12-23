export default {
    index: {
        // when displaying all items
        meta: {
            description:
                'Equip items to feed data to your jinni, help it evolve in different ways faster, and get personalized mini-games',
        },
    },
    MaliksMajik: {
        meta: {
            description:
                'The Master of the Jinn, Malik, has blessed you with his Majik. You are now able to bond to aitems to your Jinni!',
            perks: `
1. Ability to wond with your first Jinn 
2. Become official player and start saving your game data
3. Join the private player game chat in Telegram
            `,
        },
        equipping: {
            modal: {
                title: 'You are equipping an item',
                text: `Let Malik's Majik bless you with his power and lead you to your jinni!`,
            },
        },
        equipped: {
            modal: {
                title: 'You have sucessfully equipped your item!',
                text: `Over a great many battles you have won the honor to claim this item in your ether bag`,
            },
        },
        unequipped: {
            modal: {},
        },
        'post-equip': {
            modal: {
                title: 'Congrats on acquiring your new item!',
                text: ({ pid, proof }: { pid: string; proof: string }) =>
                    `${pid} has been blessed with Malik's Majik! \n Proof: ${proof}`,
            },
        },
    },
    AndroidHealthConnect: {
        meta: {
            description:
                'Connect your Android Health Connect to your Jinni to generate energy for them. Requires downloading the official Google app first',
            perks: '1. Train your Jinni to become stronger and more powerful with your daily activity',
        },
        equipping: {
            modal: {
                title: 'You are equipping an item',
                text: `You are letting your jinni absorb power from the energy you generate with your phone`,
            },
        },
        equipped: {
            modal: {
                title: 'You have sucessfully equipped your item!',
                text: `Your Jinni is more connected to you and the physical world than ever! Keep your phone on you while you walk and exercise to generate energy for them`,
            },
        },
        'post-equip': {
            modal: {
                title: 'Congrats on acquiring your new item!',
                text: `Your Jinni is more connected to you and the physical world than ever! Keep your phone on you while you walk and exercise to generate energy for them`,
            },
        },
    },
    Spotify: {
        meta: {
            description:
                'Login to Spotify so your Jinni can listen to your music with you, learn what kind of music you like, and resonate with your current vibes',
            perks: `1. Imbue your energy into your Jinni so it can vibe with you better
2. Unlock social features to discover and share music with your friends
            `,
        },
        equipping: {
            modal: {
                title: 'You are equipping an item',
                text: `Resonate your vibrations with your jinni with your Spotify playlists`,
            },
        },
        equipped: {
            modal: {
                title: 'You have sucessfully equipped your item!',
                text: `Your Jinni is vibin to your beats`,
            },
        },
        'post-equip': {
            modal: {
                title: 'Congrats on acquiring your new item!',
                text: ``,
            },
        },
    },
    Github: {
        meta: {
            description:
                'Login to Github so your Jinni learn from your dev skills and automagically evolve',
            perks: `1. Train your Jinni on how you think
2. Track your daily work routines
3. Expand your network effect with other devs
            `,
        },
        equipping: {
            modal: {
                title: 'You are equipping an item',
                text: `Suctioning 🐙 on to your giga🧠`,
            },
        },
        equipped: {
            modal: {
                title: 'You have sucessfully equipped your item!',
                text: `Your Jinni is succing on your sweet brain juice`,
            },
        },
        'post-equip': {
            modal: {
                title: 'Congrats on acquiring your new item!',
                text: ``,
            },
        },
    },
};
