import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import "./App.css"
import logo from "./logo.svg"
import abi from "./utils/BookShelf.json"

const getEthereumObject = () => window.ethereum

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject()

        /*
         * First make sure we have access to the Ethereum object.
         */
        if (!ethereum) {
            console.error("Make sure you have Metamask!")
            return null
        }

        console.log("We have the Ethereum object", ethereum)
        const accounts = await ethereum.request({ method: "eth_accounts" })

        if (accounts.length !== 0) {
            const account = accounts[0]
            console.log("Found an authorized account:", account)
            return account
        } else {
            console.error("No authorized account found")
            return null
        }
    } catch (error) {
        console.error(error)
        return null
    }
}

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("")
    const [bookTitle, setBookTitle] = useState("")

    const [allBooks, setAllBooks] = useState([])
    const contractAddress = "0xfC860BDe8CFed2DaEd94556C85E80f6EBEA6d75f" // Change for each deployment

    const contractABI = abi.abi // Add to ./utils/BookShelf.json after each deployment.

    /*
     * Create a method that gets all books from the contract
     */
    const getAllBooks = async () => {
        const { ethereum } = window

        try {
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const bookPortalContract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                )

                /*
                 * Call the getAllBooks method from the Smart Contract
                 */
                const books = await bookPortalContract.getAllQuills()

                /*
                 * Only posting user address, transaction timestamp, and message in our UI.
                 */

                const booksCleaned = books.map((book) => {
                    return {
                        address: book.author,
                        timestamp: new Date(book.timestamp * 1000),
                        message: book.message,
                    }
                })

                /*
                 * Store book data in React State
                 */
                setAllBooks(booksCleaned)
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Listen in for emitter events!
     */
    useEffect(() => {
        let bookPortalContract

        const onNewBook = (from, timestamp, message) => {
            console.log("NewBook", from, timestamp, message)
            setAllBooks((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
            ])
        }

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()

            bookPortalContract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            )
            bookPortalContract.on("NewBook", onNewBook)
        }

        return () => {
            if (bookPortalContract) {
                bookPortalContract.off("NewBook", onNewBook)
            }
        }
    }, [])

    const connectWallet = async () => {
        try {
            const ethereum = getEthereumObject()
            if (!ethereum) {
                alert("Get Metamask!")
                return
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            })

            console.log("Connected", accounts[0])
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.error(error)
        }
    }

    /*
     * Interaction with the BookShelf smart contract from our web app.
     */
    const quill = async () => {
        try {
            const { ethereum } = window

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const bookPortalContract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                )

                let count = await bookPortalContract.getTotalQuills()
                console.log("Retrieved total quill count...", count.toNumber())

                /*
                 * Execute the actual quill signing from your smart contract
                 */
                const quillTxn = await bookPortalContract.quill(bookTitle, {
                    gasLimit: 1000000,
                })
                console.log("Mining...", quillTxn.hash)

                await quillTxn.wait()
                console.log("Mined -- ", quillTxn.hash)

                count = await bookPortalContract.getTotalQuills()
                console.log("Retrieved total book count...", count.toNumber())
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    /*
     * The passed callback function will be run when the page loads.
     * Or, when the App component "mounts".
     */
    useEffect(() => {
        const searchAccount = async () => {
            const account = await findMetaMaskAccount()
            if (account !== null) {
                setCurrentAccount(account)
            }
        }
        searchAccount().catch(console.error)
    }, [])

    return (
        <div className="mainContainer">
            <div className="navbar">
                <div className="navPadding">
                    <div className="nav_container">
                        {/*
                         * If there is no currentAccount, render this button
                         */}
                        {!currentAccount && (
                            <button
                                className="connectWallet"
                                onClick={connectWallet}
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="dataContainer">
                <div className="header">📚 BookShelf</div>

                <div className="bio">
                    Welcome to BookShelf! We love a good read. If you've got a
                    favorite book for us, we're all ears.
                </div>

                <div className="bio2">
                    Connect your wallet and recommend a book title to be added
                    to the decentralized library for the chance to win ETH!
                </div>

                <form className="enterBook">
                    <input
                        className="nameField"
                        type="text"
                        required
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="Read a good book lately?..."
                    />
                </form>

                <button className="bookButton" onClick={quill}>
                    Add book! ✒️
                </button>

                {allBooks.map((book, index) => {
                    return (
                        <div
                            key={index}
                            style={{
                                backgroundColor: "black",
                                marginTop: "16px",
                                padding: "8px",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                        >
                            <div>Address: {book.address}</div>
                            <div>Time: {book.timestamp.toString()}</div>
                            <div>Message: {book.message}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default App
