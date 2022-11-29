const { ethers } = require("hardhat")

const main = async () => {
    const bookContractFactory = await ethers.getContractFactory("BookShelf")
    const bookContract = await bookContractFactory.deploy({
        value: ethers.utils.parseEther("0.1"),
    })
    await bookContract.deployed()
    console.log(`Contract deployed to: ${bookContract.address}`)

    /*
     * Get contract balance.
     */
    let contractBalance = await ethers.provider.getBalance(bookContract.address)
    console.log("Contract balance:", ethers.utils.formatEther(contractBalance))

    /*
     * Send book.
     */
    const bookTxn = await bookContract.quill("This is book #1")
    await bookTxn.wait()

    const bookTxn2 = await bookContract.quill("This is book #2")
    await bookTxn2.wait()

    /*
     * Get contract balance again
     */
    contractBalance = await ethers.provider.getBalance(bookContract.address)
    console.log("contractBalance: ", ethers.utils.formatEther(contractBalance))

    let allBooks = await bookContract.getAllBooks()
    console.log("Books currently on the shelf:", allBooks)
}

const runMain = async () => {
    try {
        await main()
        process.exit(0) // exit node process without error.
    } catch (error) {
        console.log(error)
        process.exit(1) // exit node process while indicating 'Uncaught Fatal Exception' error.
    }
}

runMain()
