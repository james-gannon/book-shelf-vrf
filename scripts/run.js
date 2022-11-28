const { ethers } = require("hardhat")

const main = async () => {
    // const [owner, randomPerson] = await hre.ethers.getSigners()
    const bookContractFactory = await ethers.getContractFactory("BookPortal")
    const bookContract = await bookContractFactory.deploy({
        value: ethers.utils.parseEther("0.1"),
    })
    await bookContract.deployed()
    console.log(`Contract deployed to: ${bookContract.address}`)
    // console.log("Contract deployed by:", owner.address)

    /*
     * Get contract balance.
     */

    let contractBalance = await ethers.provider.getBalance(bookContract.address)
    console.log("Contract balance:", ethers.utils.formatEther(contractBalance))

    /*
     * Send book
     */

    const bookTxn = await bookContract.quill("This is book #1")
    await bookTxn.wait()

    const bookTxn2 = await bookContract.quill("This is book #2")
    await bookTxn2.wait()

    // let bookTxn = await bookContract.quill('"A message!"')
    // await bookTxn.wait() // wait for transaction to be mined

    /*
     * Get contract balance again
     */

    contractBalance = await ethers.provider.getBalance(bookContract.address)
    console.log("contractBalance: ", ethers.utils.formatEther(contractBalance))

    /* let bookCount
     * bookCount = await bookContract.getTotalQuills()
     * console.log(bookCount.toNumber())
     */

    /* const [_, randomPerson] = await hre.ethers.getSigners()
     * bookTxn = await bookContract.connect(randomPerson).quill("Another message!")
     * await bookTxn.wait() // wait for transaction to be mined
     */

    let allBooks = await bookContract.getAllBooks()
    console.log("Books currently on the shelf:", allBooks)

    /*
     * =======================================================================================
     * =======================================================================================
     */

    //await bookContract.getTotalQuills()

    /*const firstBookTxn = await bookContract.quill()
    await firstBookTxn.wait()

    await bookContract.getTotalQuills()

    const secondBookTxn = await bookContract.connect(randoPerson).quill()
    await secondBookTxn.wait()

    await bookContract.getTotalQuills()*/
}

const runMain = async () => {
    try {
        await main()
        process.exit(0) // exit node process without error.
    } catch (error) {
        console.log(error)
        process.exit(1) // exit node process while indicating 'Uncaught Fatal Exception' error
    }
}

runMain()
