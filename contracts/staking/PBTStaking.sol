/**
 * @title PBT Staking
 * @dev This contract allows users to stake PBT tokens and earn PBT token rewards.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PBTStaking {

    // Information about each user's staking status.
    struct UserInfo {
        uint256 amount;        // The amount of PBT tokens staked by the user.
        uint256 rewardDebt;    // The debt of rewards accumulated by the user.
    }

    uint256 public lastRewardBlock;    // Last block number that PBT distribution occurred.
    uint256 public endBlock;           // The last block number when PBT distribution ends.
    uint256 accPbtPerShare;            // Accumulated PBT per share, times 1e12.

    // The PBT TOKEN
    IERC20 public immutable pbt;
    // PBT tokens minted per block.
    uint256 public pbtPerBlock;
    // The source of all PBT rewards
    uint256 public pbtForRewards;
    // The total PBT deposits
    uint256 public totalDeposits;
    // Info of each user that stakes PBT tokens.
    mapping(address => UserInfo) public userInfo;

    // Events emitted for tracking user activities.
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    /**
     * @dev Constructor to initialize the PBT Staking contract.
     * @param _pbt The address of the PBT token contract.
     * @param _pbtPerBlock The number of PBT token rewards per block.
     * @param _startBlock The block number when staking rewards start.
     * @param _totalRewards The total amount of PBT tokens allocated for rewards.
     */
    constructor(IERC20 _pbt, uint256 _pbtPerBlock, uint256 _startBlock, uint256 _totalRewards) {
        require(_startBlock > block.number, "StartBlock must be in the future");
        pbt = _pbt;
        pbtPerBlock = _pbtPerBlock;
        lastRewardBlock = _startBlock;
        endBlock = _startBlock + _totalRewards / _pbtPerBlock;
    }

    /**
     * @dev View function to see pending PBT rewards on frontend.
     * @param _user The address of the user to query.
     * @return The pending PBT rewards for the user.
     */
    function pendingPbt(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];

        uint256 rewardPerShare = accPbtPerShare;
        uint256 denominator = totalDeposits;

        uint256 blockToUse = block.number;
        if (blockToUse > endBlock) {
            blockToUse = endBlock;
        }
        if (blockToUse > lastRewardBlock && denominator != 0) {
            uint256 pbtReward = (blockToUse - lastRewardBlock) * pbtPerBlock;
            rewardPerShare += (pbtReward * 1e12 / denominator);
        }
        return (user.amount * rewardPerShare / 1e12) - user.rewardDebt;
    }

    /**
     * @dev Deposit PBT tokens into the staking contract.
     * @param _amount The amount of PBT tokens to be deposited.
     */
    function deposit(uint256 _amount) external {
        _deposit(_amount);
    }

    /**
     * @dev Compound rewards by re-depositing earned PBT tokens.
     */
    function compoundDeposit() external {
        _deposit(0);
    }

    /**
     * @dev Withdraw PBT tokens (including deposited amount and rewards).
     * @param _amount The amount of PBT tokens to be withdrawn.
     */
    function withdraw(uint256 _amount) external {
        _withdraw(_amount);
    }

    /**
     * @dev Claim earned rewards without withdrawing deposited PBT tokens.
     */
    function claimRewards() external {
        _withdraw(0);
    }

    /**
     * @dev Emergency function to withdraw all deposited PBT tokens without caring about rewards.
     * Should only be called in emergency situations.
     */
    function emergencyWithdraw() external {
        UserInfo storage user = userInfo[msg.sender];
        pbt.transfer(address(msg.sender), user.amount);

        user.amount = 0;
        user.rewardDebt = 0;

        emit EmergencyWithdraw(msg.sender, user.amount);
    }

    /**
     * @dev Internal function to handle depositing PBT tokens.
     * @param _amount The amount of PBT tokens to be deposited.
     */
    function _deposit(uint256 _amount) internal {
        _updateRewards();

        UserInfo storage user = userInfo[msg.sender];

        uint256 pending;
        if (user.amount > 0) {
            pending = (user.amount * accPbtPerShare / 1e12) - user.rewardDebt;
        }
        user.amount += _amount + pending;
        user.rewardDebt = user.amount * accPbtPerShare / 1e12;

        totalDeposits += _amount + pending;

        if (_amount > 0) {
            pbt.transferFrom(address(msg.sender), address(this), _amount);
        }
        emit Deposit(msg.sender, _amount);
    }

    /**
     * @dev Internal function to handle withdrawing PBT tokens.
     * @param _amount The amount of PBT tokens to be withdrawn.
     */
    function _withdraw(uint256 _amount) internal {
        _updateRewards();

        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = (user.amount * accPbtPerShare / 1e12) - user.rewardDebt;

        require(_amount <= user.amount, "Withdrawal exceeds balance");

        user.amount -= _amount;
        user.rewardDebt = user.amount * accPbtPerShare / 1e12;

        totalDeposits -= _amount;

        pbt.transfer(address(msg.sender), _amount + pending);
        emit Withdraw(msg.sender, _amount + pending);
    }

    /**
     * @dev Internal function to update rewards based on the current block.
     */
    function _updateRewards() internal {
        uint256 _lastRewardBlock = lastRewardBlock;
        uint256 _endBlock = endBlock;
        uint256 blockToUse = block.number;

        if (blockToUse <= _lastRewardBlock || _lastRewardBlock >= _endBlock) {
            return;
        }
        if (blockToUse > _endBlock) {
            blockToUse = _endBlock;
        }

        uint256 denominator = totalDeposits;
        if (denominator == 0) {
            lastRewardBlock = blockToUse;
            return;
        }
        uint256 pbtReward = (blockToUse - _lastRewardBlock) * pbtPerBlock;
        pbtForRewards += pbtReward;
        accPbtPerShare += (pbtReward * 1e12 / denominator);
        lastRewardBlock = blockToUse;
    }
}
