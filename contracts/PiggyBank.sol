//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title PiggyBank Smart Contract
contract PiggyBank {

    //state variables
    address public owner;

    //events
    event Deposit(uint amount);
    event Withdraw(uint amount);

    mapping(address => uint) balances;

    constructor(){
        owner=msg.sender;
    }

    receive() external payable{
        //increment balance of sender
        balances[msg.sender]+= msg.value;
        emit Deposit(msg.value);
    }

    function withdraw() external payable {
        //Address to withdraw ETH into
        address payable receiver = payable(msg.sender);
        uint amount = balances[msg.sender];

        //check if address has any funds
        require(amount>0, "You don't have any funds to withdraw");
        
        //transfer ether balance to receiver
        (bool sent, ) = receiver.call{value: amount}("");
        require(sent, "Failed to send ether");
        balances[msg.sender]=0;

        //emit event
        emit Withdraw(amount);
    }

    function close() external {
        require(msg.sender == owner, "You are not the owner of this PiggyBank");

        //emit event before smart contract is destroyed
        emit Withdraw(address(this).balance);
        //destroys the smart contract and transfers all ether to the address specified
        selfdestruct(payable(msg.sender));
    }

    function getUserBalance() external view returns(uint) {
        return balances[msg.sender];
    }

    /**
    * @dev Retrieves the total balance of the Smart Contract.
    * @return address(this).balance The total balance of the Smart Contract.
    */
    function getBalance() external view returns(uint){
        require(msg.sender == owner, "Only the owner can view total balance");
        return address(this).balance;
    }
}