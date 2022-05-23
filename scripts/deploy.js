const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main(){

    const tokenContract = await ethers.getContractFactory('PiggyBank');

    const deployedTokenContract = await tokenContract.deploy();

    console.log("Token Contract Address ",deployedTokenContract.address);

}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(error);
        process.exit(1);
    }
);