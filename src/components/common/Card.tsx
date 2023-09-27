import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import Link from 'components/common/Link';


interface CardProps {
  image: string;
  title: string;
  subtitle: string;
  path?: string;
  styleOverride?: object;
  badges: string[];
}

const Card: React.FC<CardProps> = ({ styleOverride = {}, image, title, subtitle, path, badges }) => {
  const CardContent = () => (
    <View style={{ ...styleOverride }}>
      <Image source={{ uri: image }} style={{ width: '100%', height: '50%' }} />
      <Text>{title}</Text>
      <Text>{subtitle}</Text>
      {!badges.length ? null : (
        <View style={styles.badgeContainer}> 
            {badges.map((badge) => (
                <View key={badge} style={styles.badge}>
                    <Text>{badge}</Text>
                </View>
            ))}
        </View>
      )}
    </View>
  );

  return path ? <Link to={path}><CardContent /></Link> : <CardContent />;
};

const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        height: 25,
        width: 50,
        backgroundColor: 'lightgray',
        borderRadius: 20
    },

});

export default Card;
