import { uuid } from './uuid';

let iframeLoadInProgress: boolean = false;
let iframePromise: Promise<HTMLIFrameElement>;
let iframe: HTMLIFrameElement;

export function getBridgeIframe(url: string, timeout: number = 5000): Promise<HTMLIFrameElement> {
    if (iframeLoadInProgress) {
        // iframe loading in progress
        return iframePromise;
    } else {
        if (!iframe) {
            // iframe not loaded or requested force reload
            iframeLoadInProgress = true;
            iframePromise = new Promise((resolve, reject) => {
                const id = 'wbi-' + uuid();
                const i: HTMLIFrameElement = document.createElement('iframe');
                i.width = '0';
                i.height = '0';
                i.frameBorder = '0';
                i.id = id;
                i.src = url;

                // setup timeout
                const timeoutInstance = setTimeout(() => {
                    reject('TIMEOUT_EXCEEDED');
                }, timeout);

                // iframe load completed
                i.onload = () => {
                    // console.log('iframe successfully loaded');
                    iframe = i;
                    iframeLoadInProgress = false;
                    clearTimeout(timeoutInstance);
                    resolve(i);
                };

                // iframe error
                i.onerror = (event) => {
                    clearTimeout(timeoutInstance);
                    reject(event);
                };

                document.body.appendChild(i);
            });
            return iframePromise;
        } else {
            return Promise.resolve(iframe);
        }
    }
}
