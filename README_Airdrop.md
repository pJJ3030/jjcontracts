# ClaimValidator Contract

## Description

The ClaimValidator contract facilitates the claiming of PBT tokens by holders of a specific ERC721 Non-Fungible Token (NFT) collection. It ensures that only the owners of the NFTs can claim PBT tokens, and each NFT token can only claim once.

## Functions

### Constructor
Initializes the contract with the addresses of the PBT token contract, the NFT contract, and the amount of PBT tokens that can be claimed per NFT.

Parameters:
```
_PBT: Address of the ERC20 token contract representing PBT tokens.
_NFT: Address of the ERC721 token contract representing the NFT collection.
_pbtPerClaim: Number of PBT tokens that can be claimed per NFT.
```


### calculatePBT
Calculates the total amount of PBT tokens that can be claimed for a given array of NFT token IDs.

Parameters:
```
tokenIds: Array of NFT token IDs for which the PBT tokens are to be calculated.
```
Returns:
```
uint256: Total amount of PBT tokens that can be claimed.
```

### claim
Allows the owner of an NFT to claim their entitled PBT tokens.

Parameters:
```
tokenId: ID of the NFT being claimed.
```

### batchClaim
Allows the owner to claim PBT tokens for multiple NFTs in a single transaction.

Parameters:
```
tokenIds: Array of NFT token IDs to be claimed.
```
