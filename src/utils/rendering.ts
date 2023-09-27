import ZuzaluIcon from 'assets/coordinations/zuzalu';

export const getIconForWidget = (widgetId: string) => {
    switch (widgetId.toLowerCase()) {
        case 'zuzalu':
            return ZuzaluIcon;
        default:
            return ZuzaluIcon;
    }
}