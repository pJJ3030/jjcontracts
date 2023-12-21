// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * This contract should only be used to stake PBT token, and earn PBT token rewards.
 */
contract PBTStaking {

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    uint256 public lastRewardBlock; // Last block number that PBT distribution occurred.
    uint256 public endBlock; // The Last block number when PBT distribution ends.
    uint256 accPbtPerShare; // Accumulated PBT per share, times 1e12.

    // The PBT TOKEN
    IERC20 public immutable pbt;
    // PBT tokens minted per block.
    uint256 public pbtPerBlock;
    // The source of all PBT rewards
    uint256 public pbtForRewards;
    // The total PBT deposits
    uint256 public totalDeposits;
    // Info of each user that stakes LP tokens.
    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(IERC20 _pbt, uint256 _pbtPerBlock, uint256 _startBlock, uint256 _totalRewards) {
        require(_startBlock > block.number, "StartBlock must be in the future");
        pbt = _pbt;
        pbtPerBlock = _pbtPerBlock;
        lastRewardBlock = _startBlock;
        endBlock = _startBlock + _totalRewards/_pbtPerBlock;
    }

    // View function to see pending PBT rewards on frontend.
    function pendingPbt(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];

        uint256 rewardPerShare = accPbtPerShare;
        uint256 denominator = totalDeposits;
        
        uint256 blockToUse = block.number;
        if(blockToUse > endBlock) {
            blockToUse = endBlock;
        }
        if (blockToUse > lastRewardBlock && denominator != 0) {
            uint256 pbtReward = (blockToUse - lastRewardBlock) * pbtPerBlock;
            rewardPerShare += (pbtReward * 1e12 / denominator);
        }
        return (user.amount * rewardPerShare / 1e12) - user.rewardDebt;
    }

    // Deposit PBT tokens
    function deposit(uint256 _amount) external {
        _deposit(_amount);
    }

    // Compound reward PBT tokens
    function compoundDeposit() external {
        _deposit(0);
    }

    // Withdraw PBT tokens (deposit + rewards)
    function withdraw(uint256 _amount) external {
        _withdraw(_amount);
    }

    // Withdraw PBT tokens (only rewards)
    function claimRewards() external {
        _withdraw(0);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw() external {
        UserInfo storage user = userInfo[msg.sender];
        pbt.transfer(address(msg.sender), user.amount);

        user.amount = 0;
        user.rewardDebt = 0;

        emit EmergencyWithdraw(msg.sender, user.amount);
    }

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

        if(_amount > 0) {
            pbt.transferFrom(address(msg.sender), address(this), _amount);
        }
        emit Deposit(msg.sender, _amount);
    }

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

    // Update rewards
    function _updateRewards() internal {
        uint256 _lastRewardBlock = lastRewardBlock;
        uint256 _endBlock = endBlock;
        uint256 blockToUse = block.number;

        if (blockToUse <= _lastRewardBlock || _lastRewardBlock >= _endBlock) {
            return;
        }
        if(blockToUse > _endBlock) {
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
