import { NetworkStateType } from 'expo-network';
// import { MarkedDates } from 'react-native-calendars/src/types';

export interface CurrentConnection {
    type: NetworkStateType;
    isLocal: boolean; // if player can connect to others on the same network without internet
    isNoosphere: boolean; // if connected to internet
}

export interface MayanArchetype {
    id: string;
    number: number;
    energyType: string;
    activations: string[];
}

export interface MayanTone {
    id: string;
    number: number;
}

export type Kin = [number, MayanTone, MayanArchetype];
export type Wavespell = [Kin, Kin]; // [start day, end day]
export type TzolkinConfig = { [key: string]: Kin }; // key = yyyy-mm-dd
