/**
 * @title PBT LP Staking
 * @dev This contract allows users to stake LP tokens and earn PBT token rewards.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PBTLPStaking {
    using SafeERC20 for IERC20;

    // Information about each user's staking status.
    struct UserInfo {
        uint256 amount;        // The amount of LP tokens staked by the user.
        uint256 rewardDebt;    // The debt of rewards accumulated by the user.
    }

    // Information about each staking pool.
    struct PoolInfo {
        IERC20 lpToken;         // Address of LP token contract.
        uint256 lastRewardBlock; // Last block number that PBT distribution occurred.
        uint256 endBlock;        // The last block number when PBT distribution ends.
        uint256 accPbtPerShare;  // Accumulated PBT per share, times 1e12.
    }

    // The PBT TOKEN
    IERC20 public pbt;
    // PBT tokens minted per block.
    uint256 public pbtPerBlock;
    // Info of the staking pool.
    PoolInfo public poolInfo;
    // Info of each user that stakes LP tokens.
    mapping(address => UserInfo) public userInfo;
    // The source of all PBT rewards
    uint256 public pbtForRewards;

    // Events emitted for tracking user activities.
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    /**
     * @dev Constructor to initialize the PBT LP Staking contract.
     * @param _pbt The address of the PBT token contract.
     * @param _lpToken The address of the LP token contract.
     * @param _pbtPerBlock The number of PBT tokens rewarded per block.
     * @param _startBlock The block number when staking starts.
     * @param _totalRewards The total amount of PBT tokens allocated for rewards.
     */
    constructor(IERC20 _pbt, IERC20 _lpToken, uint256 _pbtPerBlock, uint256 _startBlock, uint256 _totalRewards) {
        require(_startBlock > block.number, "StartBlock must be in the future");
        require(_lpToken != _pbt, "LP token must not be PBT");

        pbt = _pbt;
        pbtPerBlock = _pbtPerBlock;
        poolInfo = PoolInfo({
            lpToken: _lpToken,
            lastRewardBlock: _startBlock,
            endBlock: _startBlock + _totalRewards / _pbtPerBlock,
            accPbtPerShare: 0
        });
    }

    /**
     * @dev View function to see pending PBT rewards on frontend.
     * @param _user The address of the user to query.
     * @return The pending PBT rewards for the user.
     */
    function pendingPbt(address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo;
        UserInfo storage user = userInfo[_user];
        uint256 accPbtPerShare = pool.accPbtPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));

        uint256 blockToUse = block.number;
        if (blockToUse > pool.endBlock) {
            blockToUse = pool.endBlock;
        }
        if (blockToUse > pool.lastRewardBlock && lpSupply != 0) {
            uint256 pbtReward = (blockToUse - pool.lastRewardBlock) * pbtPerBlock;
            accPbtPerShare = accPbtPerShare + ((pbtReward * 1e12) / lpSupply);
        }
        return ((user.amount * accPbtPerShare) / 1e12) - user.rewardDebt;
    }

    /**
     * @dev Deposit LP tokens into the PBT LP Staking for PBT allocation.
     * @param _amount The amount of LP tokens to be deposited.
     */
    function deposit(uint256 _amount) external {
        PoolInfo storage pool = poolInfo;
        UserInfo storage user = userInfo[msg.sender];
        _updatePool();
        if (user.amount > 0) {
            uint256 pending = ((user.amount * pool.accPbtPerShare) / 1e12) - user.rewardDebt;
            if (pending > 0) {
                pbtForRewards -= pending;
                pbt.transfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        }
        user.amount += _amount;
        user.rewardDebt = (user.amount * pool.accPbtPerShare) / 1e12;
        emit Deposit(msg.sender, _amount);
    }

    /**
     * @dev Withdraw LP tokens from the PBT LP Staking.
     * @param _amount The amount of LP tokens to be withdrawn.
     */
    function withdraw(uint256 _amount) external {
        PoolInfo storage pool = poolInfo;
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "withdraw: not enough balance");
        _updatePool();
        uint256 pending = ((user.amount * pool.accPbtPerShare) / 1e12) - user.rewardDebt;
        if (pending > 0) {
            pbtForRewards -= pending;
            pbt.transfer(msg.sender, pending);
        }
        user.amount -= _amount;
        user.rewardDebt = (user.amount * pool.accPbtPerShare) / 1e12;
        if (_amount > 0) {
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        emit Withdraw(msg.sender, _amount);
    }

    /**
     * @dev Emergency function to withdraw all deposited LP tokens without caring about rewards.
     * Should only be called in emergency situations.
     */
    function emergencyWithdraw() external {
        PoolInfo storage pool = poolInfo;
        UserInfo storage user = userInfo[msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    /**
     * @dev Internal function to update reward variables of the staking pool to be up-to-date.
     */
    function _updatePool() internal {
        PoolInfo storage pool = poolInfo;

        uint256 blockToUse = block.number;
        if (blockToUse <= pool.lastRewardBlock || pool.lastRewardBlock >= pool.endBlock) {
            return;
        }
        else if(blockToUse >= pool.endBlock) {
            blockToUse = pool.endBlock;
        }

        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = blockToUse;
            return;
        }

        uint256 pbtReward = (blockToUse - pool.lastRewardBlock) * pbtPerBlock;
        require(pbt.balanceOf(address(this)) - pbtForRewards >= pbtReward, "Insufficient PBT tokens for rewards");
        pbtForRewards += pbtReward;
        pool.accPbtPerShare += ((pbtReward * 1e12)/lpSupply);
        pool.lastRewardBlock = blockToUse;
    }
}
