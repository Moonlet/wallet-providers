import { IExtensionMessage, IExtensionResponse } from '../types';
import { PubSub } from '../utils/pub-sub';
import { getBridgeIframe } from '../utils/iframe-bridge';
import { uuid } from '../utils/uuid';

const BRIDGE_URL = 'https://api.moonlet.io/';

// trigger iframe injection
getBridgeIframe(BRIDGE_URL);

export abstract class GenericProvider<O = any> {
    protected pubSub = PubSub();
    protected blockchain: string;
    protected options: O;

    constructor(blockchain: string, options?: O) {
        this.blockchain = blockchain;
        this.options = options;

        window.addEventListener('message', (event: MessageEvent) => {
            this.onBridgeMessage(event);
        });
    }

    protected abstract onBridgeMessage(event: MessageEvent);

    protected request(
        method: string,
        params: any[],
        timeout: number = 0
    ): Promise<IExtensionResponse> {
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
                    blockchain: this.blockchain,
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
                    if (message.response.error) {
                        reject(message.response);
                    } else {
                        resolve(message.response);
                    }
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
    }

    protected subscribe(event: string, subscriber: Function) {
        return this.pubSub.subscribe(event, subscriber);
    }

    protected unsubscribe(event, subscriber) {
        return this.pubSub.unsubscribe(event, subscriber);
    }
}
