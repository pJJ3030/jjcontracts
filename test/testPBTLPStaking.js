const { expect } = require("chai");
const { ethers } = require("hardhat");

async function mineBlocks(n) {
	for (var i = 0; i < n; i++) {
		await ethers.provider.send('evm_increaseTime', [1]);
		await ethers.provider.send('evm_mine');	
	}
}

async function getCurrentBlock() {
    let blockNum = await ethers.provider.getBlockNumber();
    return blockNum;
}

describe("PBT LP Staking", function () {
	
	let pbt;

	let pbtLP;

	let PBTLPStaking;
	let pbtLPStaking;

	let owner;
	let addr1;
	let addr2;
	let addrs;

	let oneUnit = ethers.utils.parseEther("1");
	let pbtPerBlock = oneUnit.mul(1000);
	let startBlock;
	let endBlock;

	beforeEach(async function () {

		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
		
		let PBT = await ethers.getContractFactory("PBT");
		pbt = await PBT.deploy();
		await pbt.deployed();

		lp = await PBT.deploy();
		await lp.deployed();

		let currentBlock = await getCurrentBlock();
		startBlock = currentBlock + 10;
		endBlock = startBlock + 40;

		let PBTLPStaking = await ethers.getContractFactory("PBTLPStaking");
		
		pbtLPStaking = await PBTLPStaking.deploy(pbt.address, lp.address, pbtPerBlock, startBlock, pbtPerBlock.mul(endBlock-startBlock));
		await pbtLPStaking.deployed();

        await lp.connect(owner).approve(pbtLPStaking.address, oneUnit.mul(1_000_000_000));
        await lp.connect(addr1).approve(pbtLPStaking.address, oneUnit.mul(1_000_000_000));
        await lp.connect(addr2).approve(pbtLPStaking.address, oneUnit.mul(1_000_000_000));

        await lp.transfer(addr1.address, oneUnit.mul(1_000_000));
        await lp.transfer(addr2.address, oneUnit.mul(1_000_000));

        await pbt.transfer(pbtLPStaking.address, oneUnit.mul(10_000_000));
	});

	it("Single user - Pending PBT", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration);

		let pendingRewards = await pbtLPStaking.pendingPbt(addr1.address);
		expect(pendingRewards).to.equal(pbtPerBlock.mul(duration));
	});

	it("Single user - Pending PBT 2", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		let currentBlock = await getCurrentBlock();
		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(endBlock-currentBlock);

		let pendingRewards = await pbtLPStaking.pendingPbt(addr1.address);
		expect(pendingRewards).to.equal(pbtPerBlock.mul(endBlock-currentBlock-1));
	});

	it("Two users - Pending PBT", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtLPStaking.connect(addr2).deposit(depositAmount);
		await mineBlocks(duration);

		expect(await pbtLPStaking.pendingPbt(addr1.address)).to.equal(pbtPerBlock.mul(duration * 1.5));
		expect(await pbtLPStaking.pendingPbt(addr2.address)).to.equal(pbtPerBlock.mul(duration / 2));
	});

	it("Single user - Multi deposit", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration-2);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration);

		let deposit = await pbtLPStaking.userInfo(addr1.address);
		await pbtLPStaking.connect(addr1).withdraw(deposit[0]);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration*2)));
	});

	it("Single user - Withdraw", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);

		await mineBlocks(duration - 1);

		await pbtLPStaking.connect(addr1).withdraw(depositAmount);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration)));
	});

	it("Single user - Withdraw After End time", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 40;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await pbtLPStaking.connect(addr1).deposit(depositAmount);

		await mineBlocks(duration + 10);

		await pbtLPStaking.connect(addr1).withdraw(depositAmount);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration)));
	});

	it("Single user - Emergency Withdraw", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);

		await pbtLPStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtLPStaking.connect(addr1).emergencyWithdraw();

		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance);
	});
});
