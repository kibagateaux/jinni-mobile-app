import { ItemIds, JinniTypes } from './GameMechanics';
import { WidgetConfig, WidgetIds } from './UserConfig';

export interface ApiAuthParams {
    verification: {
        _raw_query: string;
        signature: string;
    }; // cryptographic signature that proves user owns/controls an anonymous zero-knowledge identity
}

export interface ApiResponse<format> {
    data: format;
} // TODO || void

export interface HomeConfigResponse {
    jinni_id: string;
    summoner: string;
    last_divi_ts: string;
    jinni_type: JinniTypes;
    widgets: {
        id: WidgetIds;
        provider: ItemIds;
        priority: number;
        uuid: string;
    }[];
}
export interface UpdateWidgetConfigParams {
    jinniId?: string;
    widgets: WidgetConfig[];
    merge?: boolean;
    // eslint-disable-next-line
    [vals: string]: any; // allow arbitrary updates as well
}

export interface UploadRawActivityData {
    username: string;
    data: { [key: string]: object[] }; // key = ItemId. server handles normalization to :Actions
}
