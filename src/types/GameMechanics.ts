/**
 * @notice - all text content for guiding users through the game
 * @TODO - integrate i18n
*/
export type GameContent = {
  inventory: {
    [key: string]: { // key = ItemIds
        [key: string]: string; // key = ItemStatus
    },
    
  }
}
export interface Action {
  id: string; // uuid
  name: string; // human readable name
  dataSourceProvider: string; // Ingester if Incipient? Transformer if Consequential?
  timestamp: string; // time action occured IRL
}

export interface StatsAttribute {
  name:  string;
  symbol: string;
  value: number;
}

export const HealthStat: StatsAttribute = {
  "name": "Health",
  "symbol": "❤️",
  "value": 10,
};

export const StrengthStat: StatsAttribute = {
  "name": "Strength",
  "symbol": "💪",
  "value": 1,
};

export const IntelligenceStat: StatsAttribute = {
  "name": "Intelligence",
  "symbol": "🧠",
  "value": 1,
};

export const StaminaStat: StatsAttribute = {
  "name": "Stamina",
  "symbol": "🫀",
  "value": 1,
};

export const FaithStat: StatsAttribute = {
  "name": "Faith",
  "symbol": "🙏",
  "value": 1,
};

export const CommunityStat: StatsAttribute = {
  "name": "Community",
  "symbol": "🧚‍♂️",
  "value": 1,
};

export const SpiritStat: StatsAttribute = {
  "name": "Spirit",
  "symbol": "㆝",
  "value": 1,
};


export const DjinnStat: StatsAttribute = {
  "name": "Djinn",
  "symbol": "🧞",
  "value": 1,
};

export const StatsConfig = [
  HealthStat,
  StrengthStat,
  IntelligenceStat,
  StaminaStat,
  FaithStat,
  CommunityStat,
  DjinnStat,
]

export type ItemIds = 'maliks-majik'
  | 'iphone-health-kit'
  | 'iwatch-health-kit'
  | 'android-health-connect'
  & OAuthProviders;

export type ItemStatus = 'ethereal' // can be used by player but isnt installed or accessible at the moment
  | 'unequipped' // player can equip but hasnt yet
  | 'unequipping' // in the process of removig from 'equipped' -> 'unequipped'
  | 'equipping' // in the process of removig from 'unequipped' -> 'equipped'
  | 'equipped' // player is actively using item in the game
  | 'post-equip' // player just equipped/used item. temporary effect until reverts to 'equipped'
  | 'bonding' // process of imbuing item with essence
  | 'bonded'// player has imbued item with their essence
  | 'destroyed'; // item no longer usable in the game. May be repairable.

export interface InventoryItem {
    // static metadata
    id: string;
    name: string;
    image: string;
    benefits: string;
    description: string;
    attributes: StatsAttribute[];
    dataSourceProvider: string;
    installLink?: string;

    //dynamic metadata
    status?: ItemStatus; // if undefined, call checkStatus() to get value and store to local object
    checkStatus: () => Promise<ItemStatus>;
    canEquip:  () => Promise<boolean>;
    // gameplay actions
    equip?: (helper?: Function) => Promise<boolean>; // helper function passes in contextdual data, user input, react hook, etc.  that we cant hardcode in equip()
    unequip?: () => Promise<boolean>;
    actions?: InventoryAction[]; // things user can do with the item
}

export interface InventoryAction {
    id: string;
    name: string;
    symbol: string;
    isDoable?: boolean;  // if undefined, call canDo() to get value and store to local object
    canDo: (status: string) => Promise<boolean>; // checks if action can be done right now with current item status
    do: () => Promise<boolean>;
}

export interface InventoryIntegration {
  item: InventoryItem;
  checkEligibility: () => Promise<boolean>;
  getPermissions: () => Promise<boolean>;
  initPermissions: () => Promise<boolean>;
  equip: () => Promise<boolean>;
  unequip: () => Promise<boolean>;
}

export type OAuthProviders = 'spotify' 
    | 'coinbase'
    | 'strava'
    // TODO 'fitbit'export interface OAuthProviderConfig {

export interface OAuthProvider {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint?: string;
  clientId: string;
  scopes: string[];
}