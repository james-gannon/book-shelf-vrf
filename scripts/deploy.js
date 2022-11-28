const main = async () => {
    const [deployer] = await hre.ethers.getSigners()
    const accountBalance = await deployer.getBalance()

    console.log("Deploying contracts with account: ", deployer.address)
    console.log("Account balance: ", accountBalance.toString())

    const bookContractFactory = await hre.ethers.getContractFactory(
        "BookPortal"
    )
    const bookContract = await bookContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.001"),
    })
    await bookContract.deployed()

    console.log("BookPortal address: ", bookContract.address)

    if (process.env.ETHERSCAN_API_KEY) {
        // Wait 3 block confirmations
        console.log("Sit tight. Waiting for block confirmations...")
        await bookContract.deployTransaction.wait(3)
        await verify(bookContract.address, [])
    }
}

// Automatically verify our contract after it deploys

async function verify(contractAddress, args) {
    // Verify through etherscan.io API
    console.log("Verifying contract. Standby...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
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
