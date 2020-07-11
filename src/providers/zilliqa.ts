import { GenericProvider } from "./generic";

export class MoonletZilliqaProvider extends GenericProvider {
  constructor(options: any) {
    super("ZILLIQA", options);
  }

  protected onBridgeMessage(event: MessageEvent) {}
}
