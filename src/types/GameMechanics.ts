export interface Avatar {
    id: string;
    name?: string; // TODO username
    image?: string;
}

// ex. {"0x46C79830a421038E75853eD0b476Ae17bFeC289A":{"raw":{"r":"5605a907f71ab6dbbc894c7a9d118b8629104b5b20070217a4cba7fb591c102b","s":"49dff57b6b7740896f77187361ca098a2059b8979e7412ad18023f8c85112d9c","v":27},"der":"304502205605a907f71ab6dbbc894c7a9d118b8629104b5b20070217a4cba7fb591c102b022100b6200a849488bf769088e78c9e35f6749a55244f10d48d8ea7d01f004b2513a5","ether":"0x5605a907f71ab6dbbc894c7a9d118b8629104b5b20070217a4cba7fb591c102b49dff57b6b7740896f77187361ca098a2059b8979e7412ad18023f8c85112d9c1b"}}
export interface JubjubSignature {
    ether: string; // 0x hex value of signed messaged
    der: string; // idk
    raw: {
        // proof to derive signature and signer?
        r: string;
        s: string;
        v: number;
    };
}
export interface JubJubSigResponse {
    etherAddress: string;
    signature: JubjubSignature;
}

export interface SummoningProofs {
    [jubmojiAddress: string]: JubjubSignature;
}

/**
 * @notice - all text content for guiding users through the game
 * @TODO - integrate i18n
 */
export type ModalContentProps = {
    wizard: {
        // key 0-indexed order
        [key: number]: {
            title: string | ((dialogueData: object) => string);
            text: string | ((dialogueData: object) => string);
        };
    };
    // key = ItemIds;
    modal: {
        title: string | ((dialogueData: object) => string);
        text: string | ((dialogueData: object) => string);
    };
};
export type GameContent = {
    inventory: {
        [key: string]: {
            // key = ItemIds;
            [key: string]:
                | {
                      // key = meta
                      description: string;
                      perks: string;
                  }
                | ModalContentProps; // key = ItemStatus
        };
    };
    onboarding: {
        modals: {
            [key: string]: {
                // key = OnboardinFlowId
                [key: string]: string; // key = ModalId
            };
        };
    };
    modals: {
        [key: string]: {
            // key = ModalId
            [key: string]: ModalContentProps;
        };
    };
};
export interface Action {
    id: string; // uuid
    name: string; // human readable action name e.g. "walking"
    dataProvider: string; // Ingester if Incipient? Transformer if Consequential?
    startTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime: string; // ISO string '2023-06-20T23:53:15.405Z'
}

export type ResourceAccessibility = 'public' | 'permissioned' | 'private' | 'secret';
export interface Resource {
    id?: string; // uuid
    provider_id: string;
    name: string; // title of resource given by player in provider system
    resource_type: string; // human readable action name e.g. "repo", "music"
    href: string; //
    dataProvider: string;
    accessibility: string;
    image: string;
    creators: Avatar[];
}

export interface StatsAttribute {
    name: string;
    symbol: string;
    value: number;
}

export const HealthStat: StatsAttribute = {
    name: 'Health',
    symbol: '❤️',
    value: 10,
};

export const StrengthStat: StatsAttribute = {
    name: 'Strength',
    symbol: '💪',
    value: 1,
};

export const IntelligenceStat: StatsAttribute = {
    name: 'Intelligence',
    symbol: '🧠',
    value: 1,
};

export const CommunityStat: StatsAttribute = {
    name: 'Community',
    symbol: '🧚‍♂️',
    value: 1,
};

export const SpiritStat: StatsAttribute = {
    name: 'Spirit',
    symbol: '㆝',
    value: 1,
};

export const DjinnStat: StatsAttribute = {
    name: 'Djinn',
    symbol: '🧞',
    value: 1,
};

// export const StaminaStat: StatsAttribute = {
//     name: 'Stamina',
//     symbol: '🫀',
//     value: 1,
// };
//
// export const FaithStat: StatsAttribute = {
//     name: 'Faith',
//     symbol: '🙏',
//     value: 1,
// };

export const StatsConfig = [
    DjinnStat,
    HealthStat,
    StrengthStat,
    IntelligenceStat,
    CommunityStat,
    // StaminaStat,
    // FaithStat,
];

export type JinniTypes = 'p2p' | 'p2c';
export type ItemIds =
    | 'MaliksMajik'
    | 'Spotify'
    | 'Github'
    | 'IphoneHealthKit'
    | 'IwatchHealthKit'
    | ('AndroidHealthConnect' & OAuthProviderIds);

export type ItemStatus =
    | void
    | 'ethereal' // can be used by player but isnt installed or accessible at the moment
    | 'idle' // can be used by player immediately
    | 'unequipped' // player can equip but hasnt yet
    | 'unequipping' // in the process of moving from 'equipped' -> 'unequipped'
    | 'equipping' // in the process of moving from 'unequipped' -> 'equipped'
    | 'equipped' // player is actively using item in the game
    | 'post-equip' // player just equipped/used item. temporary effect until reverts to 'equipped'
    | 'bonding' // process of imbuing item with essence
    | 'bonded' // player has imbued item with their essence
    | 'destroyed'; // item no longer usable in the game. May be repairable.

export type ItemTags = 'physical' | 'digital' | 'exercise' | 'social' | 'music' | 'productivity';

// export type AbilityStatus = 'unequipped' | 'notdoable' | 'doable' | 'complete';

// TODO return null if successful or error string if failure instead of boolean
// so we can give contextual UI updates based on error path.
export type HoF = <T, R>(func?: (data?: T) => R) => Promise<boolean>;

export interface InventoryItem {
    // static metadata
    id: ItemIds;
    name: string;
    image: string;
    tags?: ItemTags[];
    attributes: StatsAttribute[];
    dataProvider: string;
    installLink?: string;

    //dynamic metadata
    status?: ItemStatus; // if undefined, call checkStatus() to get value and store to local object
    checkStatus: () => Promise<ItemStatus>;
    canEquip: () => Promise<boolean>;
    // gameplay actions
    // helper function passes in contextdual data, user input, react hook, etc.  that we cant hardcode in equip()
    equip?: HoF;
    unequip?: HoF;

    // TODO refactor to object with ids as keys
    abilities?: ItemAbility[]; // things user can do with the item
    // dont know if widget on item page will be same as WidgetConfig.
    // Might just be content and the id so only need list of ID strings here
    widgets?: ItemAbility[]; // things user can do with the item
}

export interface WidgetSettingInput {
    widget_id: string;
    provider: ItemIds;
    priority: number;
    provider_id?: string;
}

export interface ItemAbility {
    id: string;
    name: string;
    provider: ItemIds;
    symbol: string;
    description: string;
    displayType: 'home' | 'none';
    status?: ItemStatus; // if undefined, call canDo() to get value and store to local object
    canDo: (status: ItemStatus) => Promise<ItemStatus>; // checks if action can be done right now with current item status
    do: <T>(params?: T) => Promise<HoF>; // do sets up initial action e.g. querying item's api and returns a function for user to act after setup
    getOptions?: <T>() => Promise<T[] | void>; // settings for player to select before calling do()
}

// TODO I feel like this should all be rolled into InventoryItem
export interface InventoryIntegration {
    item: InventoryItem;
    permissions?: string[];
    checkEligibility: () => Promise<boolean>;
    getPermissions: () => Promise<boolean>;
    initPermissions: () => Promise<boolean>;
    equip: (helper?: HoF) => Promise<boolean>;
    unequip: (helper?: HoF) => Promise<boolean>;
}

export type OAuthProviderIds = 'Spotify' | 'Github' | 'Coinbase' | 'Strava';

export interface OAuthProvider {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
    clientId: string;
    scopes: string[];
    state?: string; // signed nonce to verify to server + app that response is valid and from user
}
