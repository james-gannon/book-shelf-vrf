const main = async () => {
    const [deployer] = await hre.ethers.getSigners()
    const accountBalance = await deployer.getBalance()

    console.log("Deploying contracts with account: ", deployer.address)
    console.log("Account balance: ", accountBalance.toString())

    const bookContractFactory = await hre.ethers.getContractFactory(
        "BookPortal"
    )
    const bookContract = await bookContractFactory.deploy()
    await bookContract.deployed()

    console.log("BookPortal address: ", bookContract.address)
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

runMain()
