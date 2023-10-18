import { RenderItemParams } from 'react-native-draggable-flatlist';

export interface Avatar {
    id: string;
    name: string;
    image: string;
}

export interface UserSettings {
    defaultTheme: 'light' | 'dark';
}
export interface HomeConfig {
    jinniImage: string;
    widgets: WidgetConfig[];
    tabs: WidgetConfig[]
}

export interface WidgetConfig {
    id: WidgetIds;
    title: string;
    path: string;
}

export type RenovatingWidgetConfig = RenderItemParams<WidgetConfig>

export type TabIds = 
    'home'          // 2/10
    | 'inventory'   // 8/10
    | 'tzolkin'     // 1/10
    | 'auth'        // 10/10
    | 'intention'   // 0/10
    | 'quest'       // 0/10
    | 'experiment'  // 010
    | ''

// TODO to capital case? like DataSource names?
export type GameWidgetIds = 'stat-djinn'
    | 'stat-health'
    | 'stat-community'
    | 'stat-intelligence'
    | 'stat-faith'
    | 'stat-stength'
    | 'stat-stamina'
    | 'stat-spirit'
    // player action portals



export type ItemWidgetIds = 'maliks-majik-leaderboard'
    // identity
    | 'spotify-profile'
    | 'spotify-most-played'
    // coordination
    | 'google-agenda'
    | 'luma-agenda'
    // social
    | 'jubjub-collect'
    | 'jubjub-talk'
    | 'jubjub-display'

export type WidgetIds = TabIds & GameWidgetIds & ItemWidgetIds;