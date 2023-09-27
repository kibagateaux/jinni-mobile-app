import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Link from './Link';


interface LinkProps {
    widgetId: string;
    text: string;
    src?: string;
    SVG?: React.FC; 
    to?: string;
    height?: number | string;
    width?: number | string;
}

const WidgetIcon = ({ widgetId, SVG, src, text, to, ...svgProps }: LinkProps) => {
  return (
    <Link to={to ?? ''} trackingId={widgetId}>
        <View style={styles.container}>
          <View style={styles.svg}>
            { !SVG ? null : <SVG {...svgProps} />}
          </View>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode='tail'>
                {text}
            </Text>
        </View>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svg: {
    height: '50%',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    width: '100%',
    overflow: 'hidden',
  },
});

export default WidgetIcon;
