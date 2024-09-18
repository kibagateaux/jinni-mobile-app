import { WidgetConfig } from './UserConfig';

export interface ApiAuthParams {
    verification: {
        _raw_query: string;
        signature: string;
    }; // cryptographic signature that proves user owns/controls an anonymous zero-knowledge identity
}

export interface ApiResponse<format> {
    data: format;
}
export interface UpdateWidgetConfigParams {
    jinniId: string;
    widgets: WidgetConfig[];
    merge?: boolean;
}

export interface UploadRawActivityData {
    username: string;
    data: { [key: string]: object[] }; // key = ItemId. server handles normalization to :Actions
}
