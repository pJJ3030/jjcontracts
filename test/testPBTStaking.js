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

describe("PBT Staking", function () {
	
	let pbt;
	let pbtStaking;

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

		let currentBlock = await getCurrentBlock();
		startBlock = currentBlock + 10;
		endBlock = startBlock + 40;

		let PBTStaking = await ethers.getContractFactory("PBTStaking");
		pbtStaking = await PBTStaking.deploy(pbt.address, pbtPerBlock, startBlock, pbtPerBlock.mul(endBlock-startBlock));
		await pbtStaking.deployed();

        await pbt.connect(owner).approve(pbtStaking.address, oneUnit.mul(1_000_000_000));
        await pbt.connect(addr1).approve(pbtStaking.address, oneUnit.mul(1_000_000_000));
        await pbt.connect(addr2).approve(pbtStaking.address, oneUnit.mul(1_000_000_000));

        await pbt.transfer(addr1.address, oneUnit.mul(1_000_000));
        await pbt.transfer(addr2.address, oneUnit.mul(1_000_000));

        await pbt.transfer(pbtStaking.address, oneUnit.mul(10_000_000));
	});

	it("Single user - Pending PBT", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration);

		let pendingRewards = await pbtStaking.pendingPbt(addr1.address);
		expect(pendingRewards).to.equal(pbtPerBlock.mul(duration));
	});

	it("Single user - Pending PBT 2", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		let currentBlock = await getCurrentBlock();
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(endBlock-currentBlock);

		let pendingRewards = await pbtStaking.pendingPbt(addr1.address);
		expect(pendingRewards).to.equal(pbtPerBlock.mul(endBlock-currentBlock-1));
	});

	it("Two users - Pending PBT", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtStaking.connect(addr2).deposit(depositAmount);
		await mineBlocks(duration);

		expect(await pbtStaking.pendingPbt(addr1.address)).to.equal(pbtPerBlock.mul(duration * 1.5));
		expect(await pbtStaking.pendingPbt(addr2.address)).to.equal(pbtPerBlock.mul(duration / 2));
	});

	it("Single user - Multi deposit", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration-2);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration);

		let deposit = await pbtStaking.userInfo(addr1.address);
		await pbtStaking.connect(addr1).withdraw(deposit[0]);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration*2)));
	});

	it("Single user - Withdraw", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);

		await mineBlocks(duration - 1);

		await pbtStaking.connect(addr1).withdraw(depositAmount);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration)));
	});

	it("Single user - Withdraw After End time", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 40;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await pbtStaking.connect(addr1).deposit(depositAmount);

		await mineBlocks(duration + 10);

		await pbtStaking.connect(addr1).withdraw(depositAmount);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.add(pbtPerBlock.mul(duration)));
	});

	it("Single user - Emergency Withdraw", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);

		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtStaking.connect(addr1).emergencyWithdraw();

		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance);
	});

	it("Single user - Compound rewards", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtStaking.connect(addr1).compoundDeposit();

		let pendingRewards = await pbtStaking.pendingPbt(addr1.address);
		let depositWorth = (await pbtStaking.userInfo(addr1.address))[0];

		expect(pendingRewards).to.equal("0");
		expect(depositWorth).to.equal(depositAmount.add(pbtPerBlock.mul(duration)));
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.sub(depositAmount));
	});

	it("Single user - Claim rewards", async function () {
		const depositAmount = oneUnit.mul(1000);
		const duration = 10;

		let startingBalance = await pbt.balanceOf(addr1.address);
		await mineBlocks(duration);
		await pbtStaking.connect(addr1).deposit(depositAmount);
		await mineBlocks(duration - 1);
		await pbtStaking.connect(addr1).claimRewards();

		let pendingRewards = await pbtStaking.pendingPbt(addr1.address);
		let depositWorth = (await pbtStaking.userInfo(addr1.address))[0];

		expect(pendingRewards).to.equal("0");
		expect(depositWorth).to.equal(depositAmount);
		expect(await pbt.balanceOf(addr1.address)).to.equal(startingBalance.sub(depositAmount).add(pbtPerBlock.mul(duration)));
	});
});
