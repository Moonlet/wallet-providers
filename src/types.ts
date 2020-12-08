// Extension internal communication
// between background script and:
//  - content script
//  - browser action
//
// Extension external communication
// between content script and web pages (wallet providers)

export interface IExtensionResponse {
    error?: string;
    message?: string;
    data?: any;
}

export interface IExtensionRequest {
    controller: string;
    blockchain: string;
    method: string;
    params: any[];
}

export interface IExtensionMessage {
    id: string;
    target?: 'MOONLET_EXTENSION';
    type: 'REQUEST' | 'RESPONSE' | 'EVENT';
    request?: IExtensionRequest;
    response?: IExtensionResponse;
}

export enum ExtensionEvents {
    DEFAULT_ACCOUNT_CHANGED = 'DEFAULT_ACCOUNT_CHANGED',
    CURRENT_NETWORK_CHANGED = 'CURRENT_NETWORK_CHANGED',
}
