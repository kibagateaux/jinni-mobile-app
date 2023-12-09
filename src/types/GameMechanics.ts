/**
 * @notice - all text content for guiding users through the game
 * @TODO - integrate i18n
 */
export type GameContent = {
    inventory: {
        [key: string]: {
            // key = ItemIds
            [key: string]: string; // key = ItemStatus
        };
    };
};
export interface Action {
    id: string; // uuid
    name: string; // human readable action name e.g. "walking"
    datasource: string; // Ingester if Incipient? Transformer if Consequential?
    startTime: string; // ISO string '2023-06-20T23:53:15.405Z'
    endTime: string; // ISO string '2023-06-20T23:53:15.405Z'
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

export const StaminaStat: StatsAttribute = {
    name: 'Stamina',
    symbol: '🫀',
    value: 1,
};

export const FaithStat: StatsAttribute = {
    name: 'Faith',
    symbol: '🙏',
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

export const StatsConfig = [
    HealthStat,
    StrengthStat,
    IntelligenceStat,
    StaminaStat,
    FaithStat,
    CommunityStat,
    DjinnStat,
];

export type ItemIds =
    | 'MaliksMajik'
    | 'IphoneHealthKit'
    | 'IwatchHealthKit'
    | ('AndroidHealthConnect' & OAuthProviderIds);

export type ItemStatus =
    | 'ethereal' // can be used by player but isnt installed or accessible at the moment
    | 'unequipped' // player can equip but hasnt yet
    | 'unequipping' // in the process of removig from 'equipped' -> 'unequipped'
    | 'equipping' // in the process of removig from 'unequipped' -> 'equipped'
    | 'equipped' // player is actively using item in the game
    | 'post-equip' // player just equipped/used item. temporary effect until reverts to 'equipped'
    | 'bonding' // process of imbuing item with essence
    | 'bonded' // player has imbued item with their essence
    | 'destroyed'; // item no longer usable in the game. May be repairable.

export type ItemTags = 'physical' | 'digital' | 'exercise' | 'social' | 'music' | 'productivity';

// TODO return null if successful or error string if failure instead of boolean
// so we can give contextual UI updates based on error path.
export type HoF = <T, R>(func?: (data?: T) => R) => Promise<boolean>;

export interface InventoryItem {
    // static metadata
    id: string;
    name: string;
    image: string;
    tags?: ItemTags[];
    attributes: StatsAttribute[];
    datasource: string;
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
    //
    abilities?: ItemAbility[]; // things user can do with the item
    // dont know if widget on item page will be same as WidgetConfig.
    // Might just be content and the id so only need list of ID strings here
    widgets?: ItemAbility[]; // things user can do with the item
}

export interface ItemAbility {
    id: string;
    name: string;
    symbol: string;
    description: string;
    isDoable?: boolean; // if undefined, call canDo() to get value and store to local object
    canDo: (status: ItemStatus) => Promise<boolean>; // checks if action can be done right now with current item status
    do: () => Promise<HoF>; // do sets up initial action e.g. querying item's api and returns a function for user to act after setup
}

// TODO I feel like this should all be rolled into InventoryItem
export interface InventoryIntegration {
    item: InventoryItem;
    checkEligibility: () => Promise<boolean>;
    getPermissions: () => Promise<boolean>;
    initPermissions: () => Promise<boolean>;
    equip: (helper?: HoF) => Promise<boolean>;
    unequip: (helper?: HoF) => Promise<boolean>;
}

export type OAuthProviderIds = 'Spotify' | 'Coinbase' | 'Strava';
// TODO 'fitbit'export interface OAuthProviderConfig {

export interface OAuthProvider {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
    clientId: string;
    scopes: string[];
}
