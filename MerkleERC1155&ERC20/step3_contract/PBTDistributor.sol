// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library MerkleProof {
        /**
         * @dev Returns true if a `leaf` can be proved to be a part of a Merkle tree
         * defined by `root`. For this, a `proof` must be provided, containing
         * sibling hashes on the branch from the leaf to the root of the tree. Each
         * pair of leaves and each pair of pre-images are assumed to be sorted.
         */
        function verify(
                bytes32[] memory proof,
                bytes32 root,
                bytes32 leaf
        ) internal pure returns (bool) {
                return processProof(proof, leaf) == root;
        }

        /**
         * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
         * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
         * hash matches the root of the tree. When processing the proof, the pairs
         * of leafs & pre-images are assumed to be sorted.
         *
         * _Available since v4.4._
         */
        function processProof(bytes32[] memory proof, bytes32 leaf) internal pure returns (bytes32) {
                bytes32 computedHash = leaf;
                for (uint256 i = 0; i < proof.length; i++) {
                        bytes32 proofElement = proof[i];
                        if (computedHash <= proofElement) {
                                // Hash(current computed hash + current element of the proof)
                                computedHash = _efficientHash(computedHash, proofElement);
                        } else {
                                // Hash(current element of the proof + current computed hash)
                                computedHash = _efficientHash(proofElement, computedHash);
                        }
                }
                return computedHash;
        }

        function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
                assembly {
                        mstore(0x00, a)
                        mstore(0x20, b)
                        value := keccak256(0x00, 0x40)
                }
        }
}

contract PBTDistributor {

    IERC20 public immutable PBT;
    bytes32 public immutable merkleRoot;
    mapping(address => bool) public hasClaimed;

    /// @notice Thrown if address has already claimed
    error AlreadyClaimed();
    /// @notice Thrown if address/amount are not part of Merkle tree
    error NotInMerkle();

    constructor(address _pbt, bytes32 _merkleRoot) {
        PBT = IERC20(_pbt);
        merkleRoot = _merkleRoot;
    }

    /// @notice Emitted after a successful token claim
    /// @param to recipient of claim
    /// @param amount of tokens claimed
    event Claim(address indexed to, uint256 amount);


    /// @notice Allows claiming tokens if address is part of merkle tree
    /// @param to address of claimee
    /// @param amount of tokens owed to claimee
    /// @param proof merkle proof to prove address and amount are in tree
    function claim(address to, uint256 amount, bytes32[] calldata proof) external {
        // Throw if address has already claimed tokens
        if (hasClaimed[to]) revert AlreadyClaimed();

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(abi.encodePacked(to, amount));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert NotInMerkle();

        // Set address to claimed
        hasClaimed[to] = true;

        // Transfer tokens to address
        PBT.transfer(to, amount);

        // Emit claim event
        emit Claim(to, amount);
    }
}
