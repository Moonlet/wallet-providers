import { PubSub } from "../utils/pub-sub";
import { getBridgeIframe } from "../utils/iframe-bridge";
import { uuid } from "../utils/uuid";

const BRIDGE_URL = "https://api.moonlet.io/";

// trigger iframe injection
getBridgeIframe(BRIDGE_URL);

export abstract class GenericProvider<O = any> {
  protected pubSub = PubSub();
  protected blockchain: string;
  protected options: O;

  constructor(blockchain: string, options?: O) {
    this.blockchain = blockchain;
    this.options = options;

    window.addEventListener("message", (event: MessageEvent) => {
      this.onBridgeMessage(event);
    });
  }

  protected abstract onBridgeMessage(event: MessageEvent);

  request(method: string, params: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const requestId = uuid();
      // todo: timeout implementation
      const onMessage = (event: MessageEvent) => {
        // todo: check message origin

        const data = (event || {}).data || {};
        if (data.id === requestId && data.type === "MOONLET_RPC_RESPONSE") {
          if (data.success) {
            resolve(data.response);
          } else {
            reject(data.response);
          }
          window.removeEventListener("message", onMessage);
        }
      };
      window.addEventListener("message", onMessage);

      const iframe = await getBridgeIframe(BRIDGE_URL);
      iframe.contentWindow.postMessage(
        {
          id: requestId,
          type: "MOONLET_RPC_REQUEST",
          blockchain: this.blockchain,
          method,
          params,
        },
        BRIDGE_URL
      );
    });
  }

  subscribe(event: string, subscriber: Function) {
    return this.pubSub.subscribe(event, subscriber);
  }

  unsubscribe(event, subscriber) {
    return this.pubSub.unsubscribe(event, subscriber);
  }
}
