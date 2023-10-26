import { Link } from 'expo-router';

import { Linking, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from '@segment/analytics-react-native';

interface LinkProps {
    children: React.ReactNode;
    to: string;
    trackingId?: string;
    styleOverride?: object;
}

const LinkButton = ({ children, to, trackingId, styleOverride }: LinkProps) => {
    // const navigation = useNavigation();
    const { track } = useAnalytics();
    const isInternal = !to.startsWith('http');

    const handlePress = () => {
        if (to) {
            Linking.openURL(to);
            trackNavigation();
        }
    };

    const trackNavigation = () => {
        console.log('trackNavigation', to);
        track('Link Clicked', {
            path: to,
            trackingId,
        });
    };

    return isInternal ? (
        <Link style={styleOverride} href={to} onPress={trackNavigation}>
            {children}
        </Link>
    ) : (
        <TouchableOpacity style={styleOverride} onPress={handlePress}>
            {children}
        </TouchableOpacity>
    );
};

export default LinkButton;
