// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract BookPortal is VRFV2WrapperConsumerBase {
    uint256 totalQuills;

    event fiftyFiftyRequest(uint256 requestId);
    event fiftyFiftyResult(uint256 requestId, bool didWin);

    struct fiftyFiftyStatus {
        uint256 fees;
        uint256 randomWord;
        address author;
        bool didWin;
        bool fulfilled;
    }

    enum fiftyFiftySelection {
        WIN,
        LOSS
    }

    mapping(uint256 => fiftyFiftyStatus) public statuses;

    address constant linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address constant vrfWrapperAddress =
        0x708701a1DfF4f478de54383E49a627eD4852C816;

    uint256 constant prizeAmount = 0.0001 ether;
    uint32 constant callbackGasLimit = 1_000_000;
    uint32 constant numWords = 1;
    uint16 constant requestConfirmations = 3;

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

    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastQuilledAt;

    constructor()
        payable
        VRFV2WrapperConsumerBase(linkAddress, vrfWrapperAddress)
    {
        console.log(
            "I am not a reasoning machine like you, but I'll gladly store your books!"
        );
    }

    /*
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     *
     * @param roller address of the roller
     */

    function quill(string memory _message) public payable returns (uint256) {
        lastQuilledAt[msg.sender] = block.timestamp;

        totalQuills += 1;
        console.log("%s just added %s to the library!", msg.sender, _message);

        /*
         * This is where I actually store the book data in the array.
         */
        books.push(Book(msg.sender, _message, block.timestamp));

        // Generate a new seed for the next user that sends a wave

        uint256 requestId = requestRandomness(
            callbackGasLimit,
            requestConfirmations,
            numWords
        );

        statuses[requestId] = fiftyFiftyStatus({
            fees: VRF_V2_WRAPPER.calculateRequestPrice(callbackGasLimit),
            randomWord: 0,
            author: msg.sender,
            didWin: false,
            fulfilled: false
            // guess: guess
        });

        emit NewBook(msg.sender, block.timestamp, _message);
        emit fiftyFiftyRequest(requestId);
        return requestId;

        /*if (seed < 50) {
            uint256 prizeAmount = 0.0001 ether;
            console.log("%s won %s!", msg.sender, prizeAmount);

            require(
                prizeAmount <= address(this).balance,
                "Insufficient funds in the contract."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract");
        }*/
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        require(statuses[requestId].fees > 0, "Request not found");

        statuses[requestId].fulfilled = true;
        statuses[requestId].randomWord = randomWords[0];

        // fiftyFiftySelection result = fiftyFiftySelection.LOSS;

        if (randomWords[0] % 100 < 50) {
            // result = fiftyFiftySelection.WIN;

            console.log("%s won %s!", statuses[requestId].author, prizeAmount);

            require(
                prizeAmount <= address(this).balance,
                "Insufficient funds in the contract."
            );
            (bool success, ) = (statuses[requestId].author).call{
                value: prizeAmount
            }("");
            require(success, "Failed to withdraw money from contract");
        }

        emit fiftyFiftyResult(requestId, statuses[requestId].didWin);
    }

    function getStatus(uint256 requestId)
        public
        view
        returns (fiftyFiftyStatus memory)
    {
        return statuses[requestId];
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
