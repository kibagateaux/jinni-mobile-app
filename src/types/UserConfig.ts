export interface Avatar {
    id: string;
    name: string;
    image: string;
}

export interface HomeConfig {
    jinniImage: string;
    widgets: WidgetConfig[];
    tabs: WidgetConfig[]
}

export interface WidgetConfig {
    name: string;
    widgetId: string;
    path: string;
}

export interface UserSettings {
    defaultTheme: 'light' | 'dark';
}

