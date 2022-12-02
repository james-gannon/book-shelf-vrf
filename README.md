# BookShelf

This project allows a user to connect their wallet (Metamask) and add their favorite book(s) to the BookShelf! All book recommendations are publicly recorded to the Ethereum blockchain, with a 50% chance to win 0.0001 ETH. The BookShelf smart contract utilizes Chailink VRF for the generation of all random numbers.

- Demo video: https://www.youtube.com/watch?v=XIS3HCLEzYM
- Live "try-it-out" link: https://james-gannon.github.io/book-shelf-vrf/
- Contract address: https://goerli.etherscan.io/address/0xfc860bde8cfed2daed94556c85e80f6ebea6d75f

## Run the following to get started

### Install and Setup

```shell
yarn install
```

-   Make sure you have a Metamask wallet funded with Goerli ETH, and update the .env file with respective RPC and Etherscan endpoint APIs.

### Deploy Contract

```shell
yarn hardhat run scripts/deploy.js --network goerli
```

### Deploy Front-end

For local host...

```shell
npm run start
```

### Fund deployed contract with test LINK

Head to [Chainlink Faucet](https://faucets.chain.link/) to add Goerli testnet LINK to your wallet, and send to the address of the deployed contract! 5+ LINK should do for inital use.

### Add a book!

Finally! Connect your wallet to the web app's front-end, add a book, and view it on the blockchain. Your submission should automatically update to the front-end as well!

Happy coding! 🥳
