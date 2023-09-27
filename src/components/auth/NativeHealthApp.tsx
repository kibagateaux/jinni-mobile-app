import { Text, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { InventoryIntegration } from 'types/GameMechanics';
import {
  iosHealth,
  androidHealth,
} from 'utils/inventory';

const NativeHealthApp = () => {
  const env = Platform.OS;
  const integration: InventoryIntegration = env === 'ios' ? iosHealth : androidHealth;

    return (
        <TouchableOpacity onPress={integration.initPermissions}>
            <Text>Connect {env === 'ios' ? 'Apple ' : 'Android '} Health</Text>
        </TouchableOpacity>
    )
  }
