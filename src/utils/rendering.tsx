import React, { ReactNode } from 'react';
import { Text } from 'react-native';
import { StatsConfig } from 'types/GameMechanics';
import ZuzaluIcon from 'assets/coordinations/zuzalu';

interface WidgetIconProps {
    // copy of tabBatIcon props, can change in futurte and interpolate if needed
    focused?: boolean;
    color?: string;
    size: number;
}
export const getIconForWidget = (widgetId: string, iconOptions: WidgetIconProps): ReactNode => {
    const widgi = widgetId.toLowerCase();
    if (widgi.startsWith('stat-'))
        return (
            StatsConfig.find((stat) => stat.name.toLowerCase() === widgi.replace('stat-', ''))
                ?.symbol ?? '¿'
        );

    const svgProps = iconOptions ?? { focused: true, color: 'black', size: 1 };
    switch (widgi) {
        case 'page-home':
            return <Text> 🧞‍♂️ </Text>;
        case 'page-inventory':
            return <Text> 📚 </Text>;
        case 'zuzalu':
            return <ZuzaluIcon {...svgProps} />;
        default:
            return <Text>¿</Text>;
    }
};
