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

describe("PBT Distributor", function () {
	
	let pbt, pbtDistributor;

	let owner;
	let addr1;
	let addr2;
	let addrs;

    const ALICE = "0x185a4dc360ce69bdccee33b3784b0282f7961aea";
    const BOB = "0xefc56627233b02ea95bae7e19f648d7dcd5bb132";

	let oneUnit = ethers.utils.parseEther("1");

	beforeEach(async function () {

		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        // Merkle root containing ALICE with 100e18 tokens but no BOB
        const merkleRoot = "0xd0aa6a4e5b4e13462921d7518eebdb7b297a7877d6cfe078b0c318827392fb55";
		
		let PBT = await ethers.getContractFactory("PBT");
		pbt = await PBT.deploy();
		await pbt.deployed();

		let PBTDistributor = await ethers.getContractFactory("PBTDistributor");
		pbtDistributor = await PBTDistributor.deploy(pbt.address, merkleRoot);
		await pbtDistributor.deployed();

        await pbt.transfer(pbtDistributor.address, oneUnit.mul(100));
	});

	it("Alice Claim Once", async function () {
		let aliceProof = ["0xceeae64152a2deaf8c661fccd5645458ba20261b16d2f6e090fe908b0ac9ca88"];
		let startingBalance = await pbt.balanceOf(ALICE);

		await pbtDistributor.claim(ALICE, oneUnit.mul(100), aliceProof);
		expect(await pbt.balanceOf(ALICE)).to.equal(startingBalance.add(oneUnit.mul(100)));
	});

    it("Alice Claim Twice", async function () {
		let aliceProof = ["0xceeae64152a2deaf8c661fccd5645458ba20261b16d2f6e090fe908b0ac9ca88"];

		await pbtDistributor.claim(ALICE, oneUnit.mul(100), aliceProof);
        await expect(pbtDistributor.claim(ALICE, oneUnit.mul(100), aliceProof)).to.be.revertedWith("AlreadyClaimed");
	});

    it("Alice Claim Invalid Proof", async function () {
		let aliceBadProof = ["0xc11ae64152a2deaf8c661fccd5645458ba20261b16d2f6e090fe908b0ac9ca88"];

        await expect(pbtDistributor.claim(ALICE, oneUnit.mul(100), aliceBadProof)).to.be.revertedWith("NotInMerkle");
	});

    it("Alice Claim Invalid Amount", async function () {
		let aliceProof = ["0xceeae64152a2deaf8c661fccd5645458ba20261b16d2f6e090fe908b0ac9ca88"];

        await expect(pbtDistributor.claim(ALICE, oneUnit.mul(200), aliceProof)).to.be.revertedWith("NotInMerkle");
	});

    it("Bob Claim", async function () {
		let aliceProof = ["0xceeae64152a2deaf8c661fccd5645458ba20261b16d2f6e090fe908b0ac9ca88"];

        await expect(pbtDistributor.claim(BOB, oneUnit.mul(100), aliceProof)).to.be.revertedWith("NotInMerkle");
	});
});
