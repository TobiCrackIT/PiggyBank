const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

async function deploy() {
    const PiggyBank = await ethers.getContractFactory("PiggyBank");
    const piggyBank = await PiggyBank.deploy();
    return piggyBank;
}

describe("PiggyBank", () => {

    //1 ether
    const amount = ethers.utils.parseEther("1.0");

    it("should have a real address if Smart Contract was successfully deployed", async function () {
        const deployedPiggyBankContract = await deploy();

        assert.notEqual(deployedPiggyBankContract.address, '');
        assert.notEqual(deployedPiggyBankContract.address, undefined);
        assert.notEqual(deployedPiggyBankContract.address, null);
        assert.notEqual(deployedPiggyBankContract.address, 0x0);
    });

    it("should have a balance of 0 when deployed", async function () {
        const deployedPiggyBankContract = await deploy();

        assert.equal(await deployedPiggyBankContract.getBalance(), 0);
    });

    it("owner should be only the account which deployed the contract", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const deployedPiggyBankContract = await deploy();
        const contractOwner = await deployedPiggyBankContract.owner();

        assert.equal(contractOwner, owner.address);
        assert.notEqual(contractOwner, addr1.address);
        assert.notEqual(contractOwner, addr2.address);

    });

    it("should update balance of smart contract when ether is received", async function () {
        const [owner, addr1] = await ethers.getSigners();

        const deployedPiggyBankContract = await deploy();
        await owner.sendTransaction({
            to: deployedPiggyBankContract.address,
            // Sends exactly 1.0 ether
            value: amount,
        });

        assert.equal(await deployedPiggyBankContract.getBalance(), 1000000000000000000);


        await addr1.sendTransaction({
            to: deployedPiggyBankContract.address,
            value: amount,
        });

        assert.equal(await deployedPiggyBankContract.getBalance(), 2000000000000000000);
    });

    it("should throw revert errors after funds are withdrawn(smart contract is destroyed)", async function () {
        const [owner] = await ethers.getSigners();

        const deployedPiggyBankContract = await deploy();
        await owner.sendTransaction({
            to: deployedPiggyBankContract.address,
            value: amount,
        });

        await deployedPiggyBankContract.connect(owner).withdraw();

        await expect(deployedPiggyBankContract.getBalance()).to.be.reverted;
        await expect(deployedPiggyBankContract.owner()).to.be.reverted;
    });

    it("should emit Deposit event", async function () {
        const [owner, addr1] = await ethers.getSigners();

        const deployedPiggyBankContract = await deploy();
        await owner.sendTransaction({
            to: deployedPiggyBankContract.address,
            value: amount,
        });

        await expect(
            addr1.sendTransaction({
                to: deployedPiggyBankContract.address,
                value: amount,
            })).to.emit(deployedPiggyBankContract, "Deposit").withArgs(amount);
    });

    it("should emit Withdraw event", async function () {
        const [owner] = await ethers.getSigners();

        const deployedPiggyBankContract = await deploy();
        await owner.sendTransaction({
            to: deployedPiggyBankContract.address,
            value: amount,
        });

        await expect(deployedPiggyBankContract.connect(owner).withdraw()).to.emit(deployedPiggyBankContract, "Withdraw").withArgs(amount);
    });


});