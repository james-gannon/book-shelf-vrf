// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract BookPortal {
    uint256 totalQuills;

    /*
     * A little magic, Google what events are in Solidity!
     */

    event NewBook(address indexed from, uint256 timestamp, string message);

    /*
     * I created a struct here named Wave.
     * A struct is basically a custom datatype where we can customize what we want to hold inside it.
     */
    struct Book {
        address author; // The address of the user who signed their book recommendation.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user signed.
    }

    /*
     * I declare a variable waves that lets me store an array of structs.
     * This is what lets me hold all the waves anyone ever sends to me!
     */
    Book[] books;

    constructor() {
        console.log(
            "I am not a reasoning machine like you, but I'll gladly store your books!"
        );
    }

    function quill(string memory _message) public {
        totalQuills += 1;
        console.log("%s just added %s to the library!", msg.sender, _message);

        /*
         * This is where I actually store the book data in the array.
         */
        books.push(Book(msg.sender, _message, block.timestamp));

        /*
         * I added some fanciness here, Google it and try to figure out what it is!
         * Let me know what you learn in #general-chill-chat
         */
        emit NewBook(msg.sender, block.timestamp, _message);

        uint256 prizeAmount = 0.0001 ether;
        require(
            prizeAmount <= address(this).balance,
            "Insufficient funds in the contract."
        );
        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Failed to withdraw money from contract");
    }

    /*
     * I added a function getAllWaves which will return the struct array, waves, to us.
     * This will make it easy to retrieve the waves from our website!
     */

    function getAllBooks() public view returns (Book[] memory) {
        return books;
    }

    function getTotalQuills() public view returns (uint256) {
        // Optional: Add this line if you want to see the contract print the value!
        // We'll also print it over in run.js as well.
        console.log("This libray holds %d books!", totalQuills);
        return totalQuills;
    }
}
