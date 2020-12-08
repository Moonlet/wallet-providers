import { PubSub } from './../utils/pub-sub';
import { ExtensionEvents } from '../../src/types';
import { extensionRequest, onExtensionEvent } from '../utils/extension-comm';
import { ZilliqaBaseProvider } from './zilliqa-base-provider';
import { composeMiddleware } from '@zilliqa-js/core/src/util';

enum ZilliqaProviderEvents {
    connected = 'connected',
    currentNetworkChanged = 'currentNetworkChanged',
    defaultAccountChanged = 'defaultAccountChanged',
}

export default class MoonletZilliqaProvider extends ZilliqaBaseProvider {
    private _connected: boolean = false;
    private _eventEmitter = PubSub();
    currentNetwork: number;
    defaultAccount: string;

    constructor() {
        super('');

        onExtensionEvent(({ event, data }) => {
            switch (event) {
                case ExtensionEvents.DEFAULT_ACCOUNT_CHANGED:
                    this.handleAccountChangeEvent();
            }
        });
    }

    connect(): Promise<string[]> {
        return this.send('GetAccount').then((res) => {
            this._eventEmitter.emit(ZilliqaProviderEvents.connected, {
                defaultAccount: res.result,
            });
            this.defaultAccount = res.result;
            this._connected = true;
            return [res.result];
        });
    }

    isConnected(): boolean {
        return false;
    }

    public send(method, ...params) {
        const [tReq, tRes] = this.getMiddleware(method);
        const reqMiddleware = composeMiddleware(...tReq);
        const resMiddleware = composeMiddleware(...tRes);
        // console.log(tReq, tRes);
        if (method === 'CreateTransaction') {
            params[0].version = params[0].version || '';
            params[0].nonce = params[0].nonce || '';
            params[0].signature = params[0].signature || '';
        }
        const req = reqMiddleware(this.buildPayload(method, params));
        return extensionRequest('ZILLIQA', req.payload.method, req.payload.params)
            .then((res) => res.data)
            .then(resMiddleware);
    }

    buildPayload(method, params): any {
        return {
            url: '',
            payload: { id: 1, jsonrpc: '2.0', method, params },
        };
    }

    signMessage(message) {
        return this.send('SignMessage', '', message);
    }

    async on(
        event: ZilliqaProviderEvents,
        cb: (data: { networkId?: number; accountAddress?: string }) => any
    ) {
        this._eventEmitter.subscribe(event, cb);
    }

    private handleAccountChangeEvent() {
        // get current account and compare it with this.defaultAccount
        if (this._connected) {
            this.send('GetAccount').then((res) => {
                if (this.defaultAccount !== res.result) {
                    this.defaultAccount = res.result;
                    this._eventEmitter.emit(ZilliqaProviderEvents.defaultAccountChanged, {
                        account: res.result,
                    });
                }
            });
        }
    }
}
