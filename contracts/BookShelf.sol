// SPDX-License-Identifier: MIT

/*
 * The purpose of this contract is to facilitate the addidtion of epic book titles to a decentralized
 * library called 'BookShelf', with the chance to win ETH along the way! Anyone can write their favorite
 * reads to the blockchain with the chance to win a small amount of ETH for their recommendation :)
 */

/*
 * This contract is part of a full-stack react web app. A user connects their Metamask wallet,
 * inputs their favorite book title, and clicks 'Add book!'. The 'quill()' fucntion is called,
 * the book title is published to the contract, Chainlink VRF is used to determine if the msg.sender
 * will be rewared ETH, and each book recommendation is updated to the front-end in real-time!
 */

pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

contract BookShelf is VRFV2WrapperConsumerBase {
    // Varibale storing the total number of books in the library
    uint256 totalQuills;

    /*
     * Cainlink VRF Wrapper variable declarations
     */
    address constant linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address constant vrfWrapperAddress =
        0x708701a1DfF4f478de54383E49a627eD4852C816;

    uint256 constant prizeAmount = 0.0001 ether;
    uint32 constant callbackGasLimit = 1_000_000;
    uint32 constant numWords = 1;
    uint16 constant requestConfirmations = 3;

    event fiftyFiftyRequest(uint256 requestId);
    event fiftyFiftyResult(uint256 requestId, bool didWin);
    event NewBook(address indexed from, uint256 timestamp, string message);

    /*
     * A 'Book' struck to store data about a given transaction
     */
    struct Book {
        address author; // The address of the user who signed their book recommendation.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user signed.
    }

    struct fiftyFiftyStatus {
        uint256 fees;
        uint256 randomWord;
        address author;
        bool didWin;
        bool fulfilled;
    }

    /*
     * This is an address => uint mapping (associate an address with a number)
     * Here, the address is stored with the last time the user recommended a book to be added to the library.
     */
    mapping(address => uint256) public lastQuilledAt;
    /*
     * Separate 50% chance mapping
     */
    mapping(uint256 => fiftyFiftyStatus) public statuses;

    /*
     * Declaration of variable 'books' that allows us to store an array of structs.
     * This holds all the books anyone ever sends to the contract!
     */
    Book[] books;

    /*
     * An enum restircts the only possible outcomes for the user winning ETH to 'WIN' and 'LOSS'.
     */
    enum fiftyFiftySelection {
        WIN,
        LOSS
    }

    constructor()
        payable
        VRFV2WrapperConsumerBase(linkAddress, vrfWrapperAddress)
    {
        console.log(
            "I am not a reasoning machine like you, but I'll gladly store your books!"
        );
    }

    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     *
     */

    /*
     * Increment total number of books in the library, and add to 'books' array.
     */

    function quill(string memory _message) public payable returns (uint256) {
        lastQuilledAt[msg.sender] = block.timestamp;

        totalQuills += 1;
        console.log("%s just added %s to the library!", msg.sender, _message);

        /*
         * This is where book data is actually stored in the array.
         */
        books.push(Book(msg.sender, _message, block.timestamp));

        // Generate a new random number for the next user that sends a book using Chainlink VRF

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
    }

    /*
     * Function to be called by the Chainlink VRF contract once random number (randomWords) is generated.
     */

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
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

    function getStatus(
        uint256 requestId
    ) public view returns (fiftyFiftyStatus memory) {
        return statuses[requestId];
    }

    /*
     * getAllBooks() will return the struct array, 'books', to us.
     * This will make it easy to retrieve the books from the website front-end.
     */

    function getAllBooks() public view returns (Book[] memory) {
        return books;
    }

    function getTotalQuills() public view returns (uint256) {
        console.log("This libray holds %d books!", totalQuills);
        return totalQuills;
    }
}
