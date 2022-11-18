const main = async () => {
    // const [owner, randomPerson] = await hre.ethers.getSigners()
    const bookContractFactory = await hre.ethers.getContractFactory(
        "BookPortal"
    )
    const bookContract = await bookContractFactory.deploy()
    await bookContract.deployed()
    console.log(`Contract deployed to: ${bookContract.address}`)
    // console.log("Contract deployed by:", owner.address)

    let bookCount
    bookCount = await bookContract.getTotalQuills()
    console.log(bookCount.toNumber())

    let bookTxn = await bookContract.quill("A message!")
    await bookTxn.wait() // wait for transaction to be mined

    const [_, randomPerson] = await hre.ethers.getSigners()
    bookTxn = await bookContract.connect(randomPerson).quill("Another message!")
    await bookTxn.wait() // wait for transaction to be mined

    let allBooks = await bookContract.getAllBooks()
    console.log(allBooks)

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
