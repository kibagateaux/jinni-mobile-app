import { Identity } from '@semaphore-protocol/identity';
import { RenderItemParams } from 'react-native-draggable-flatlist';

export interface UserSettings {
    defaultTheme: 'light' | 'dark';
}

export interface StorageKey {
    slot: string;
    secure?: boolean;
}

export type StorageValue = string | number | object | Identity | undefined | null;
export interface HomeConfig {
    jinniImage: string;
    widgets: WidgetConfig[];
    tabs: WidgetConfig[];
}

export interface WidgetConfig {
    id: WidgetIds;
    routeName: string; // Expo route navigation name
    title: string;
    path: string; // how to access via deep linking / weburl
}

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
    | 'stat-stength'
    | 'stat-stamina'
    | 'stat-spirit';

// player action portals
export type ItemWidgetIds =
    | 'maliks-majik-leaderboard'
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
