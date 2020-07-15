import { GenericProvider } from './generic';

export class MoonletEthereumProvider extends GenericProvider {
    constructor(options: any) {
        super('ETHEREUM', options);
    }

    protected onBridgeMessage(event: MessageEvent) {}
}
