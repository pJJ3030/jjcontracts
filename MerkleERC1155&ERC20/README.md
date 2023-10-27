# Instructions

## Step 1: Snapshot

1. Go to `step1_snapshot` folder
2. Edit the following variables in the `snapshot.config.json` file:
	contractAddress : token address
	tokenType : "ERC20" or "ERC1155"
	fromBlock : the start block for snapshot
	toBlock : the end block for snapshot
	totalPBTToAllot : total number PBT to give to GNO holders
3. Run `npm install`
4. Run `node index.js`
5. We now need 2 resultant files:
	`result/result_combined.csv` is the resultant file with wallet,gno_balance,pbt_balance
	`result/result_combined.json` is the file to be copied to next step

## Step 2: Merkle Generation

1. Go to `step2_generator` folder
2. Copy the file `result_combined.json` from previous step to this folder
3. Run `npm install`
4. Run `npm run start`
5. Note down the merkle root printed.

## Step 3: Deploy the distributor contract

1. Go to `step3_contract` folder
2. Deploy the PBTDistributor contract in `PBTDistributor.sol` file
3. It takes 2 inputs:  
	```address _pbt: the address of the PBT token```  
	```bytes32 _merkleRoot: the merkle root generated in the previous step```
4. Note down the address of the contract deployed.

## Step 4: Front-end

1. Go to `step4_frontend` folder
2. Modify `config.ts:L9` with exact config from `step2_generator/result_combined.json`
3. Update the environment variables  in`.env.local`, namely:  
	```NEXT_PUBLIC_CONTRACT_ADDRESS : the address of the PBTDistributor contract```  
	```NEXT_PUBLIC_RPC_NETWORK : the network id ("4" for rinkeby, "1" for mainnet)```  
4. Run `npm install`
5. Run `npm run dev` to run development build
6. Majority of the code that's needed is in the file: `step4_frontend\state\token.ts`


## Step 5: Whales data

1. Go to `step5_whales` folder
2. Copy the whale data scraped from website as file `whales.csv`
3. Run `npm install`
4. Run `node index.js`
5. Copy the generated `result_combined.json` file, and go to Step 2.
