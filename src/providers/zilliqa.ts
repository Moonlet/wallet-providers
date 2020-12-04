import { extensionRequest } from '../utils/extension-comm';
import { ZilliqaBaseProvider } from './zilliqa-base-provider';
import { composeMiddleware } from '@zilliqa-js/core/src/util';

/**
 * events
 * chainChanged, accountsChanged, message
 */
interface P {
    currentAccount: string;
}

export default class MoonletZilliqaProvider extends ZilliqaBaseProvider {
    public currentAccount: string;

    public events = ['chainChange'];

    connect(): Promise<string[]> {
        return this.send('GetAccount').then((res) => [res.result]);
    }

    isConnected(): boolean {
        return false;
    }

    constructor() {
        super('');
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
}
