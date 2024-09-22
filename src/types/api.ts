import { WidgetConfig } from './UserConfig';

export interface ApiAuthParams {
    verification: {
        _raw_query: string;
        signature: string;
    }; // cryptographic signature that proves user owns/controls an anonymous zero-knowledge identity
}

export interface ApiResponse<format> {
    data: format;
} // TODO || void
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
