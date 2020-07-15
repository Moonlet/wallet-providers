import { IExtensionResponse } from '../types';
import { GenericProvider } from './generic';

export class MoonletZilliqaProvider extends GenericProvider {
    constructor(options: any) {
        super('ZILLIQA', options);
    }

    protected onBridgeMessage(event: MessageEvent) {}

    public async send(method, ...params) {
        return this.request(method, params).then((res: IExtensionResponse) => {
            let data = res.data;
            // console.log(res);
            if (res.error) {
                data = {
                    jsonrpc: '2.0',
                    error: {
                        ...res,
                    },
                };
            }
            return data;
        });
    }
}
