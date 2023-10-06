import React from 'react';
import { StatsConfig } from 'types/GameMechanics';
import ZuzaluIcon from 'assets/coordinations/zuzalu';

export const getIconForWidget = (widgetId: string): string | React.FC | undefined => {
    const widgi = widgetId.toLowerCase();
    if(widgi.startsWith('stat-'))
        return StatsConfig.find((stat) => stat.name.toLowerCase() === widgi.replace('stat-', ''))?.symbol ?? '¿';

    switch (widgi) {
        case 'zuzalu':
            return ZuzaluIcon;
        default:
            return ZuzaluIcon;
    }
}