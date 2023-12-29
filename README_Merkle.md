# Functional Requirements
## Roles & Authorization
The distributor contract has just a single role:

* User: can claim tokens if address is part of merkle tree

All functions are publicly callable, and none of the functions require any special authorization.

## Features
The contract enables anyone to trigger a claim of PBT tokens to any address that is a part of the merkle tree, by supplying a merkle proof for the same

## Use Cases
1. The admin deploys the contract, specifying the pbt token and the merkle root.
2. The admin sends the required amount of PBT to the contract address.
3. Users can claim PBT tokens if address is part of merkle tree.

# Technical Requirements
This project has been developed with Solidity language, using Hardhat as a development environment. Javascript is the selected language for testing and scripting.

In addition, OpenZeppelin’s libraries are used in the project. All information about the contracts library and how to install it can be found in their [GitHub](https://github.com/OpenZeppelin/openzeppelin-contracts).

The project configuration is found in [hardhat.config.js](hardhat.config.js), where dependencies are indicated. Mind the relationship of this file with .env. A basic configuration of Polygon’s Mumbai testnet is described in order to deploy the contract. And an etherscan key is set to to configure its different functionalities directly from the repo. More information about this file’s configuration can be found in the [Hardhat Documentation](https://hardhat.org/hardhat-runner/docs/config).

# Architecture Overview
A general view of the Staking contract structures and interactions between different functions can be found as follows:

PBT Distributor: [PBT Distributor architecture](docs/PBT_Distributor_Architecture.svg) document

# Contract Information

This section contains detailed information (their purpose, assets, functions, and events) about the contracts used in the project.

A distribution contract that enables beneficiaries to withdraw PBT tokens they are entitled to, by providing the necessary merkle proof for the same.

1. The admin deploys the contract, specifying the pbt token and the merkle root.
2. The admin sends the required amount of PBT to the contract address.
3. Users can claim PBT tokens if address is part of merkle tree.

Kindly refer to the in-code NatSpecs for information on variables and function description.