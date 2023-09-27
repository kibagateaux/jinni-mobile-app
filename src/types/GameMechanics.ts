export interface Action {
  id: string; // uuid
  name: string; // name of action
  dataSourceProvider: string; // Ingester if Incipient, Transformer if Consequential
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


export const JinniStat: StatsAttribute = {
  "name": "Djinn",
  "symbol": "🧞",
  "value": 1,
};

export type ItemIds = 'master-0jinn-summoning-circle'
  | 'iphone-health-kit'
  | 'iwatch-health-kit'
  | 'android-health-connect'

export interface InventoryItem {
    id: string;
    name: string;
    image: string;
    attributes: StatsAttribute[];
    equipped: boolean;
    dataSourceProvider: string;
    installLink?: string;
    equip?: () => Promise<boolean>;
    unequip?: () => Promise<boolean>;
    actions?: InventoryAction[];
}

export interface InventoryAction {
    id: string;
    name: string;
    symbol: string;
    isDoable: () => Promise<boolean>;
    do: () => Promise<boolean>;
}

export interface InventoryIntegration {
  checkEligibility: () => Promise<boolean>;
  getPermissions: () => Promise<boolean>;
  initPermissions: () => Promise<boolean>;
  equip: () => Promise<boolean>;
  unequip: () => Promise<boolean>;
}
  


export type GameContent = {
  inventory: {
    'post-equip': {
        [key: string]: string; // key = ItemIds
    }
  }
}