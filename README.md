# Specifications
### Project Overview/Purpose
The projects purpose is to have launch a prediction market using the gnosis conditional token frame work. The PolyBet Token serves as the governance token of the prediction market and it will distributed to users to incentivize certain actions such as adding liquidity to the pool which enables trading.

### Functional, Technical Requirements
Functional and Technical Requirements can be found as follows:

Merkle: [Merkle requirements](README_Merkle.md) document

Staking: [Staking requirements](README_Staking.md) document

# Getting Started
Recommended Node version is 20.0.0 and above.

### Available commands

```bash
# install dependencies
$ npm install

# build for production
$ npm run build

# clean, build, run tests
$ npm run rebuild

# run tests
$ npm run test

# compute tests coverage
$ npm run coverage
```

# Project Structure
This a hardhat javascript project composed of contracts, tests, and deploy instructions.

## Tests

Tests are found in the `./test/` folder.

Both positive and negative cases are covered, and test coverage is 100%.

## Contracts

Solidity smart contracts are found in `./contracts/`

`./contracts/merkle` folder contains contracts used in token distribution.
`./contracts/staking` folder contains contracts for the PBT token, and various staking mechanisms.

## Deploy
Deploy script can be found in the `scripts` folder.

Rename `./.env.example` to `./.env` in the project root.
To add the private key of a deployer account, assign the following variables
```
PRIVATE_KEY=...
```