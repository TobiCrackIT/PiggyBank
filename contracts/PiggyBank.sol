//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract PiggyBank {

    address public owner;

    event Deposit(uint amount);
    event Withdraw(uint amount);

    constructor(){
        owner=msg.sender;
    }

    receive() external payable{
        emit Deposit(msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "You are not the owner of this PiggyBank");

        //emit event before smart contract is destroyed
        emit Withdraw(address(this).balance);
        //destroys the smart contract and transfers all ether to the address specified
        selfdestruct(payable(msg.sender));
    }

    function getBalance() external view returns(uint){
        return address(this).balance;
    }
}