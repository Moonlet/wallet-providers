import { uuid } from './uuid';
import { IExtensionResponse, IExtensionMessage } from './../types';
import { getBridgeIframe } from './iframe-bridge';
import { BRIDGE_URL } from './consts';

export const extensionRequest = (
    blockchain: string,
    method: string,
    params: any[],
    timeout: number = 0
): Promise<IExtensionResponse> => {
    return new Promise(async (resolve, reject) => {
        let timeoutInstance;
        const requestId = uuid();
        const requestMessage: IExtensionMessage = {
            id: requestId,
            target: 'MOONLET_EXTENSION',
            type: 'REQUEST',
            request: {
                controller: 'ProvidersController',
                method: 'rpc',
                blockchain: blockchain,
                params: [
                    {
                        method,
                        params,
                    },
                ],
            },
        };

        const onResponseMessage = (event: MessageEvent) => {
            const message: IExtensionMessage = event?.data;
            // todo: check message origin

            if (message.id === requestId && message.type === 'RESPONSE' && message.response) {
                resolve(message.response);
                clearTimeout(timeoutInstance);
                window.removeEventListener('message', onResponseMessage);
            }
        };
        window.addEventListener('message', onResponseMessage);

        if (timeout > 0) {
            timeoutInstance = setTimeout(() => {
                window.removeEventListener('message', onResponseMessage);
                reject({
                    ...requestMessage,
                    type: 'RESPONSE',
                    response: {
                        error: 'TIMEOUT',
                        message: `Timeout exceeded for request with id: ${requestId}`,
                    },
                } as IExtensionMessage);
            }, timeout);
        }

        const iframe = await getBridgeIframe(BRIDGE_URL);
        iframe.contentWindow.postMessage(requestMessage, BRIDGE_URL);
    });
};

export const onExtensionEvent = (cb: (e) => any): (() => void) => {
    const listenerFn = (event: MessageEvent) => {
        const message: IExtensionMessage = event?.data;
        // todo: check message origin
        if (message.type === 'EVENT' && message.response && typeof cb === 'function') {
            cb(message.response.data);
        }
    };
    window.addEventListener('message', listenerFn);

    return () => window.removeEventListener('message', listenerFn);
};
