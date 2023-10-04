import React from 'react';
import { StatsConfig } from 'types/GameMechanics';
import ZuzaluIcon from 'assets/coordinations/zuzalu';

export const getIconForWidget = (widgetId: string): string | React.FC | undefined => {
    if(widgetId.toLowerCase().startsWith('stat-'))
        return StatsConfig.find((stat) => stat.name.toLowerCase() === widgetId.replace('stat-', ''))?.symbol;

    switch (widgetId.toLowerCase()) {
        case 'zuzalu':
            return ZuzaluIcon;
        default:
            return ZuzaluIcon;
    }
}