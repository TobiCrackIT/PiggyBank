const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("PiggyBank", () => {
    let contract;
    //1 ether
    const amount = ethers.utils.parseEther("1.0");

    beforeEach(async () => {
        const PiggyBank = await ethers.getContractFactory("PiggyBank");
        contract = await PiggyBank.deploy();
    });

    it("should have a real address if Smart Contract was successfully deployed", async function () {
        assert.notEqual(contract.address, '');
        assert.notEqual(contract.address, undefined);
        assert.notEqual(contract.address, null);
        assert.notEqual(contract.address, 0x0);
    });

    it("should have a balance of 0 when deployed", async function () {
        assert.equal(await contract.getBalance(), 0);
    });

    it("owner should be only the account which deployed the contract", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const contractOwner = await contract.owner();

        assert.equal(contractOwner, owner.address);
        assert.notEqual(contractOwner, addr1.address);
        assert.notEqual(contractOwner, addr2.address);

    });

    it("should update balance of smart contract when ether is received", async function () {
        const [owner, addr1] = await ethers.getSigners();

        await owner.sendTransaction({
            to: contract.address,
            // Sends exactly 1.0 ether
            value: amount,
        });

        assert.equal(await contract.getBalance(), 1000000000000000000);


        await addr1.sendTransaction({
            to: contract.address,
            value: amount,
        });

        assert.equal(await contract.getBalance(), 2000000000000000000);
    });

    it("should update balance of smart contract after any withdrawal", async function () {
        const [owner] = await ethers.getSigners();

        await owner.sendTransaction({
            to: contract.address,
            value: amount,
        });

        assert.equal(await contract.getBalance(), 1000000000000000000);


        await contract.connect(owner).withdraw();

        assert.equal(await contract.getBalance(), 0);
    });

    it("should emit Deposit event", async function () {
        const [owner, addr1] = await ethers.getSigners();

        await owner.sendTransaction({
            to: contract.address,
            value: amount,
        });

        await expect(
            addr1.sendTransaction({
                to: contract.address,
                value: amount,
            })).to.emit(contract, "Deposit").withArgs(amount);
    });

    it("should emit Withdraw event", async function () {
        const [owner] = await ethers.getSigners();

        await owner.sendTransaction({
            to: contract.address,
            value: amount,
        });

        await expect(contract.connect(owner).withdraw()).to.emit(contract, "Withdraw").withArgs(amount);
    });

    it("should allow only owner close smart contract", async function () {
        const [owner, addr1] = await ethers.getSigners();

        await expect(contract.connect(addr1).close()).to.be.reverted;
        //await expect(contract.connect(owner).close()).to.be.reverted;
    });

    it("should destroy contract and revert all requests", async function () {
        const [owner, addr1] = await ethers.getSigners();

        await addr1.sendTransaction({
            to: contract.address,
            value: amount,
        });

        await contract.connect(owner).close();

        await expect(contract.getBalance()).to.be.reverted;
        await expect(contract.owner()).to.be.reverted;
    });


});