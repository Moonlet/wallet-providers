# Moonlet web3 providers

Since Moonlet Wallet Extension exposes the web3 providers in a different way, compared to Metamask and other simmilar extensions, there is a need of a provider library to help developer.

### MetaMask approach
MetaMask extension injects the provider on all tabs/windows opened by an user. To do this it needs a special permission in order to be able to injects scripts on all pages. 

***Pros:***
- It's very easy to integrate with MetaMask as it will automatically inject a provider on all pages, dApps just need to check if it's there and use it

***Cons:***
- The permissions needed to inject script on all pages gives MetaMask access to a lot more features:
    - access to all opened tabs
    - access to browsing history

### Moonlet approach
Moonlet extension managed to avoid any special permission, it uses a bridge iframe to comunicate between web apps and the extension. Basically Moonlet it's injecting scripts only on a few moonlet owned domains.
This library will create a provider instance that will communicate with Moonlet Extension via iframe bridge (using postMessage).

***Pros:***
- Moonlet has less access to user sensitive data
- It won't inject useless scripts in web pages that do not need them
- Moonlet provider library can be easily lazy loaded

***Cons:***
- dApp developers need to add a dependency in their project
- dApps need to create and handle provider instance

## Instalation
```
npm i --save @moonlet/providers

yarn add @moonlet/providers
```

## Zilliqa
- Using the provider standalone
```ts
import MoonletZilliqaProvider from "@moonlet/providers/zilliqa";

// create provider instance
const provider = new MoonletZilliqaProvider();

// check if already connected 
if (!provider.isConnected) {
    // connect to extension and get current account
    // the first time Moonlet Extension will display a consent screen, user will be able to selected the accounts that will allow access to
    // if user already allowed at least one account, it will return the current account directly
    const address = await provider.connect();

    // sending `true` as first parametre to connect function will force the display of the consent screen
    // usefull if user wants to allow another account
    const address = await provider.connect(true);
}

// do a random RPC request
const response = await provider.send('GetBlockchainInfo');
const response = await provider.send('GetBalance', 'd1490ba752373de5a7f526cca011b61bf111bb4c');

// Sign a message
const result = await provider.send('SignMessage', 'The message as string!');

// Send a transaction
const result = await provicer.send('CreateTransaction', {
    toAddr: "zil1arczrdu3e7xvgvqd98rrj9mdfyrysc7eecshc3", // address can be bech32 address
    amount: new BN(units.toQa("1", units.Units.Zil)), // can be also a string 
    gasPrice: units.toQa("2000", units.Units.Li), // can be also a string
    gasLimit: Long.fromNumber(1) // can be also a string
});

// Listeninng to events
const unsub = provider.on('connected', (data: { chainId: number; account: string }) => { ... })
const unsub = provider.on('currentNetworkChanged', (data: { chainId: number; }) => { ... })
const unsub = provider.on('defaultAccountChanged', (data: { account: string }) => { ... })

// Unsucscribing form events
unsub();
```

- Using the provider with ZilliqaJS library
```ts
import MoonletZilliqaProvider from "@moonlet/providers/zilliqa";

const provider = new MoonletZilliqaProvider();
const address = await provider.connect();
const zilliqa = new Zilliqa("", provider);

// apply a hack to disable internal ZilliqaJS autosigning feature
// at the moment of writing ZilliqaJS has an internal issue when using a provider, this will fix it
zilliqa.blockchain.signer = zilliqa.contracts.signer = {
    sign: (m) => m
};

const result = await zilliqa.blockchain.getBlockChainInfo();

const tx = await zilliqa.blockchain.createTransaction(
    new Transaction(
    {
        toAddr: "zil1arczrdu3e7xvgvqd98rrj9mdfyrysc7eecshc3",
        amount: new BN(units.toQa("1", units.Units.Zil)),
        gasPrice: units.toQa("2000", units.Units.Li),
        gasLimit: Long.fromNumber(1)
    } as any,
    this.state.moonlet
    )
);
```