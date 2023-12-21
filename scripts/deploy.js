// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const ethers = require("hardhat");

async function getCurrentBlock() {
    let blockNum = await ethers.provider.getBlockNumber();
    return blockNum;
}

async function main() {

    let oneUnit = ethers.utils.parseEther("1");
    let pbtPerBlock = oneUnit.mul(1000); // 1000 PBT per block

    const PBT = await ethers.getContractFactory("PBT");
    const pbt = await PBT.deploy();
    await pbt.deployed();
    console.log("PBT deployed to:", pbt.address);

    let currentBlock = await getCurrentBlock();
    let startBlock = currentBlock + 10;
    let endBlock = startBlock + 40;

    const PBTStaking = await ethers.getContractFactory("PBTStaking");
    const pbtStaking = await PBTStaking.deploy(pbt.address, pbtPerBlock, startBlock, pbtPerBlock.mul(endBlock-startBlock));
    await pbtStaking.deployed();
    console.log("PBT Staking deployed to:", pbtStaking.address);

    const lpToken = await PBT.deploy();
    await lpToken.deployed();
    console.log("LP Token deployed to:", lpToken.address);

    currentBlock = await getCurrentBlock();
    startBlock = currentBlock + 10;
    endBlock = startBlock + 40;

    const PBTLPStaking = await ethers.getContractFactory("PBTLPStaking");
    const pbtLPStaking = await PBTLPStaking.deploy(pbt.address, lpToken.address, pbtPerBlock, startBlock, pbtPerBlock.mul(endBlock-startBlock));
    await pbtLPStaking.deployed();
    console.log("LP Staking deployed to:", pbtLPStaking.address);

    const merkleRoot = "0xd0aa6a4e5b4e13462921d7518eebdb7b297a7877d6cfe078b0c318827392fb55";

    const PBTDistributor = await ethers.getContractFactory("PBTDistributor");
    const pbtDistributor = await PBTDistributor.deploy(pbt.address, merkleRoot);
    await pbtDistributor.deployed();
    console.log("PBT Distributor deployed to:", pbtDistributor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
