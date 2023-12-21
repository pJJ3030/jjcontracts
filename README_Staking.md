# Functional Requirements
## Roles
Both staking contracts have just a single role:

* User: can deposit/withdraw tokens for staking.

## Features
Both Staking contracts differ in the fundamental difference that one allows staking of PBT token, while the other allows staking of any ERC20 token. 
Both contracts provide PBT tokens as staking rewards and have the following features:

* Deposit PBT/LP tokens
* Withdraw PBT/LP tokens and PBT rewards
* Compound the earned PBT rewards to the deposit (only for PBT staking)
* Claim only the PBT rewards earned (only for PBT staking)
* Withdraw only the principal deposited, forfeiting any claim to the rewards earned so far (emergency function)

## Use Cases
1. The admin deploys the contracts, specifying the reward duration, rate and LP token (if applicable).
2. The admin sends the required amount of PBT tokens (for reward) to the contract address.
2. Users can deposit tokens to earn PBT rewards.
3. Users can choose between compounding, claiming and withdrawing from the contracts as many times as they prefer.
4. The contract gives out rewards until the end time, as specified during the contract deployment.

# Technical Requirements
This project has been developed with Solidity language, using Hardhat as a development environment. Javascript is the selected language for testing and scripting.

In addition, OpenZeppelin’s libraries are used in the project. All information about the contracts library and how to install it can be found in their [GitHub](https://github.com/OpenZeppelin/openzeppelin-contracts).

The project configuration is found in [hardhat.config.js](hardhat.config.js), where dependencies are indicated. Mind the relationship of this file with .env. A basic configuration of Polygon’s Mumbai testnet is described in order to deploy the contract. And an etherscan key is set to to configure its different functionalities directly from the repo. More information about this file’s configuration can be found in the [Hardhat Documentation](https://hardhat.org/hardhat-runner/docs/config).

# Architecture Overview
A general view of the Staking contract structures and interactions between different functions can be found as follows:

PBT Staking: [PBT Staking architecture](docs/PBT_Staking_Architecture.svg) document

LP Staking: [LP Staking architecture](docs/LP_Staking_Architecture.svg) document