import { Identity } from '@semaphore-protocol/identity';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import { ItemIds, JinniTypes } from './GameMechanics';

export interface UserSettings {
    defaultTheme: 'light' | 'dark';
}

export interface StorageKey {
    slot: string;
    secure?: boolean;
}

export type obj = { [key: string]: string };
export type StorageValue = string | number | object | Identity | undefined | null;
export interface ErrorFormat {
    error: string;
}
export type Errorable<T> = Promise<T | void | ErrorFormat>;
export interface HomeConfig {
    summoner: string; // 0x address
    lastDiviTime?: string; // iso timestamp of last :Divination action

    widgets: WidgetConfig[];
    jType: JinniTypes;
    // tabs: WidgetConfig[]; // TODO super low priority for custom navigation bc requires custom  ui/widgets configs
}

export interface HomeConfigMap {
    [jid: string]: HomeConfig;
}
export type WidgetDisplayTypes = 'none' | 'avatar' | 'nav' | 'home';
export interface WidgetConfig {
    id: WidgetIds;
    provider: ItemIds;
    priority?: number;
    displayType: WidgetDisplayTypes; // 'none' for Abilities, nav ior home for Widgets
    // navigation
    routeName: string; // Expo route navigation name
    title: string;
    path: string; // how to access via deep linking / weburl
    // custom player config for widget
    config?: unknown;
}

export interface PlayerWidgetSettings {}

export type RenovatingWidgetConfig = RenderItemParams<WidgetConfig>;

export type TabIds =
    | 'home' // 2/10
    | 'inventory' // 8/10
    | 'tzolkin' // 1/10
    | 'auth' // 10/10
    | 'intention' // 0/10
    | 'quest' // 0/10
    | 'experiment' // 010
    | '';

// TODO to capital case? like DataSource names?
export type GameWidgetIds =
    | 'stat-djinn'
    | 'stat-health'
    | 'stat-community'
    | 'stat-intelligence'
    | 'stat-faith'
    | 'stat-strength'
    | 'stat-stamina'
    | 'stat-spirit'
    | 'maliksmajik-avatar-viewer';

// player action portals
export type ItemWidgetIds =
    | 'maliksmajik-leaderboard'
    | 'maliksmajik-speak-intention'
    | 'maliksmajik-avatar-viewer'
    // identity
    | 'spotify-profile'
    | 'spotify-most-played'
    // coordination
    | 'google-agenda'
    | 'luma-agenda'
    // social
    | 'jubjub-collect'
    | 'jubjub-talk'
    | 'jubjub-display';

export type WidgetIds = TabIds | GameWidgetIds | ItemWidgetIds;
export interface LogDataQueryProps {
    playerId: string;
    itemId: string; // just for analytics not used in app so dont need exact type
    activities: string[];
    time?: string; // ISO local time
}
