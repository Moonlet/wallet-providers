export const PubSub = () => {
    const subscribers: { [event: string]: Function[] } = {};

    function emit(event: string, data: any) {
        if (subscribers[event]) {
            for (let i = 0; i < subscribers[event].length; i++) {
                if (typeof subscribers[event][i] === 'function') {
                    subscribers[event][i](data);
                } else {
                    unsubscribe(event, subscribers[event][i]);
                }
            }
        }
    }

    function subscribe(event: string, cb: Function): () => void {
        const subs = subscribers[event];
        if (!subscribers[event]) {
            subscribers[event] = [];
        }

        subscribers[event].push(cb);

        return () => {
            unsubscribe(event, cb);
        };
    }

    function unsubscribe(event, cb) {
        const subs = subscribers[event];
        if (subs) {
            subs.splice(subs.indexOf(cb), 1);
        }
    }

    return { emit, subscribe, unsubscribe };
};
