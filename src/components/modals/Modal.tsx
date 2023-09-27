import { useTheme } from 'contexts/ThemeContext';
import React, { useState, ReactNode, FunctionComponent } from 'react';
import { Text, Animated, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface ModalProps {
  size: 'full' | 'mid' | 'min';
  children: ReactNode;
  onClose: () => void;
  onPrimaryButton: () => void;
  onSecondaryButton: () => void;
}

const Modal: FunctionComponent<ModalProps> = ({ children, size, onClose, onPrimaryButton, onSecondaryButton }) => {
  const [visible, setVisible] = useState(true);
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const { height, width } = Dimensions.get('window');
  const overlayColor = theme.colorScheme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const modalStyle = {
    ...styles.modal,
    height: size === 'full' ? height : size === 'mid' ? height * 0.6 : 'auto',
    width: size === 'full' ? width : size === 'mid' ? width * 0.8 : 'auto',
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: overlayColor }]}>
      <View style={styles.modal}>
        {children}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={onPrimaryButton}>
            <Text>Primary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onSecondaryButton}>
            <Text>Secondary</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default Modal;