# Specifications
### Project Overview/Purpose
The projects purpose is to have launch a prediction market using the gnosis conditional token frame work. The PolyBet Token serves as the governance token of the prediction market and it will distributed to users to incentivize certain actions such as adding liquidity to the pool which enables trading.

### Functional, Technical Requirements
This repository consists of 2 Staking, and 1 Merkle distribution contracts. *All 3 contracts are mutually independent*, and do not interact with each other on-chain in any way.

Functional and Technical Requirements can be found as follows:

Merkle: [Merkle requirements](README_Merkle.md) document

Staking: [Staking requirements](README_Staking.md) document

# Getting Started
Recommended Node version is 20.0.0 and above.

### Available commands

```bash
# install dependencies
$ npm install

# compile
$ npx hardhat compile

# run tests
$ npm hardhat test

# compute tests coverage
$ npx hardhat coverage
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

# Audit Comments Reply

### F-2024-0366
Fixed in b889fb5ce288670d9023898eff132c40a9ee371b

### F-2024-0373
The project will ensure that at least 1 PBT token is staked for the entire duration of reward period (by staking 1 PBT before the start block) - thus ensuring no rewards are stuck behind in the contract.

### F-2024-0378
Fixed in 59bcb90a775f5f6ad8ff0811013ee5ace00222a2

### F-2024-0364
Fixed in 334ed36b177689e498631eabfa9b2ba5b09eb324 and b889fb5ce288670d9023898eff132c40a9ee371b

### F-2024-0370
Provided appropriate comments in 59bcb90a775f5f6ad8ff0811013ee5ace00222a2

### F-2024-0365
Fixed in 59bcb90a775f5f6ad8ff0811013ee5ace00222a2

### F-2024-0367
Fixed in 59bcb90a775f5f6ad8ff0811013ee5ace00222a2

### F-2024-0369
Fixed in 59bcb90a775f5f6ad8ff0811013ee5ace00222a2

### F-2024-0372
We deliberately chose not to penalize legitimate users (by imposing extra gas consumption via a check) merely to prevent stray users from depositing after the reward period. Any user who deposits after the reward period can immediately withdraw their tokens without any penalty or loss of any kind.