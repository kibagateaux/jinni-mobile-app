import { WidgetConfig } from './UserConfig';

interface ApiAuthRequirements {
    proof: string; // cryptographic signature that proves user owns/controls an anonymous zero-knowledge identity
}

export interface UpdateWidgetConfigParams extends ApiAuthRequirements {
    username: string;
    widgets: WidgetConfig[];
}

export interface UploadRawActivityData extends ApiAuthRequirements {
    username: string;
    data: { [key: string]: object[] }; // key = ItemId. server handles normalization to :Actions
}
