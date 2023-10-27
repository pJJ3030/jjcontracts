# PBT-Staking
Smart contract that rewards PBT for staking PBT tokens

## Function Descriptions (only callable by Owner)

### Constructor
Deploys the contract
- `IERC20 _pbt` : address of the PBT token
- `uint256 _pbtPerBlock` : number of PBT to be minted per block (scaled by 10^18)
- `uint256 _startBlock` : the block to start giving out rewards from (has to be a block in the future)
- `uint256 _totalRewards` : the total number of PBT to give out as rewards

## Function Descriptions (callable by anyone)

### pendingPbt
A read-only function to view the pending rewards of any user
- `_user` : the address of user whose pending rewards are to be viewed


### deposit
Deposit PBT tokens to PBTStaking contract
- `uint256 _amount` : the number of PBT tokens to deposit

### withdraw
Withdraw PBT tokens (and rewards) from PBTStaking contract (this also sends the rewards earned so far to the user)
- `uint256 _amount` : the number of PBT tokens to withdraw

### compoundDeposit
Add the rewards earned so far to the deposit, so that the user now earns a greater share of the PBT per block
This is similar to first withdrawing, and then depositing - but in a single transaction

### claimRewards
This function just sends the rewards earned so far to the user, without touching the principal deposit.

### emergencyWithdraw
This function can be called by a user to withdraw their principal if there are not enough PBT tokens in the contract to pay out rewards.


## Entire Workflow

1. Owner(you) deploys the contract with the constructor arguments mentioned above
2. Owner(you) sends '_totalRewards' PBT tokens to the contract address. 
3. User approves the contract to spend their PBT tokens
4. User calls `deposit` function with the amount of tokens to deposit.
5. At any time in the future, the user can call the `withdraw` function with same arguments as above to withdraw their tokens and all rewards.
6. They can also call the `claimRewards` or the `compoundDeposit` functions.
7. When the contract runs out of '_totalRewards' PBT, it stops giving out rewards.


## Numerical Example

````
rewards : 10 PBT per block

User 1 deposits : 100 PBT
After 5 blocks, his rewards are equal to 50 PBT.

If he calls withdraw(), he gets 150 PBT in his wallet.
If he calls claimRewards(), he gets 50 PBT, and 100 deposit stays as it is.
If he calls compoundDeposit(), his deposit is now worth 150 PBT.
````