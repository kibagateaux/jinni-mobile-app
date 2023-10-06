import { MarkedDates } from "react-native-calendars/src/types";
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
export type TzolkinConfig = {[key: string]: Kin};  // key = yyyy-mm-dd