import { createContext, useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'

// smart contracts and abi
import {
  dogeAbi,
  bitcoinAbi,
  solanaAbi,
  usdcAbi,
  dogeAddress,
  bitcoinAddress,
  solanaAddress,
  usdcAddress,
} from '../lib/constants'

export const RobinhoodContext = createContext()

export const RobinhoodProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formattedAccount, setFormattedAccount] = useState('')

    /* Keep track of selected coin */
    const [coinSelect, setCoinSelect] = useState('DOGE')
    const [toCoin, setToCoin] = useState('')

    const [balance, setBalance] = useState('')
    const [amount, setAmount] = useState('')

    /* Moralis always listens in the backend for authentication activity */
    const { isAuthenticated, authenticate, user, logout, Moralis, enableWeb3 } = useMoralis()

    useEffect(() => {
      checkWalletConnection()
    }, [isAuthenticated, enableWeb3])

    const checkWalletConnection = async () => {
      if (isAuthenticated) {
        const address = user.get('ethAddress')
        console.log('User is authenticated..', '🐱‍🏍', address)

        let formatAccount = address.slice(0, 4) + '...' + address.slice(-4)
        setFormattedAccount(formatAccount)

        setCurrentAccount(address)
        requestToCreateUserProfile(address)

        const currentBalance = await Moralis.Web3API.account.getNativeBalance({
          chain: 'rinkeby',
          address: currentAccount,
        })
        const balanceToEth = Moralis.Units.FromWei(currentBalance.balance)
        const formattedBalance = parseFloat(balanceToEth).toFixed(3)

        setBalance(formattedBalance)

      } else {
        /* There shouldn't be an account if the user is not created */
        setCurrentAccount('')
        setFormattedAccount('')
      }
    }

    const requestToCreateUserProfile = async (_walletAddress) => {
      try {
        console.log('Creating Sanity User..', '🤖')

        await fetch(`/api/createUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: _walletAddress,
          }),
        })
      } catch (error) {
        console.error(error)
      }
    }

    const getContractAddress = () => {
      if (coinSelect === 'BTC') return bitcoinAddress
      if (coinSelect === 'DOGE') return dogeAddress
      if (coinSelect === 'SOL') return solanaAddress
      if (coinSelect === 'USDC') return usdcAddress
    }
  
    const getToAddress = () => {
      if (toCoin === 'BTC') return bitcoinAddress
      if (toCoin === 'DOGE') return dogeAddress
      if (toCoin === 'SOL') return solanaAddress
      if (toCoin === 'USDC') return usdcAddress
    }
  
    const getToAbi = () => {
      if (toCoin === 'BTC') return bitcoinAbi
      if (toCoin === 'DOGE') return dogeAbi
      if (toCoin === 'SOL') return solanaAbi
      if (toCoin === 'USDC') return usdcAbi
    }

    /* We have to use ethereum and pay with the smart contract to get this tokens minted - from there mint any token (since its on eth 😍) */
    const mint = async () => {
      try {
        /* ETH - SMART CONTRACT - MINT */
        if(coinSelect === 'ETH')
        {
          if(!isAuthenticated) return

          await Moralis.enableWeb3()
          const contractAddress = getToAddress()
          const abi = getToAbi()

          let options = {
            contractAddress: contractAddress,
            functionName: 'mint',
            abi: abi,
            params: {
              to: currentAccount,
              amount: Moralis.Units.Token('50', '18'),
            },
          }
          sendEth()
          const transaction = await Moralis.executeFunction(options)
          const receipt = await transaction.wait(4)
          saveTransaction(receipt.transactionHash, amount, receipt.to)
        } else {
          /* Token - Token */
          swapTokens()
          saveTransaction(receipt.transactionHash, amount, receipt.to)

        }
      } catch (error) {
        console.log(error)
      }
    }

    const swapTokens = async () => {
      try {
        if(!isAuthenticated) return

        await Moralis.enableWeb3()

        /* Nothing should happen if the swap is between the same tokens */
        if(coinSelect === toCoin) return

        const fromOptions = {
          type: 'erc20',
          amount: Moralis.Units.Token(amount, '18'),
          receiver: getContractAddress(),
          contractAddress: getContractAddress(),
        }

        /* Example: tp: DOGE -> SOLANA : {contrac MINTs new SOLANA tokens and sends it to recepient addres} */
        const toMintOptions = {
          contractAddress: getToAddress(),
          functionName: 'mint',
          abi: getToAbi(),
          params: {
            to: currentAccount,
            amount: Moralis.Units.Token(amount, '18')
          }
        }

        let fromTransaction = await Moralis.transfer(fromOptions)
        let toMintTransaction = await Moralis.executeFunction(toMintOptions)

        let fromReceipt = await fromTransaction.wait()
        let toReceipt = await toMintTransaction.wait()

        console.log(fromReceipt)
        console.log(toReceipt)

      } catch (error) {
        console.log(error)
      }
    }

    const sendEth = async () => {
        if (!isAuthenticated) return

        const contractAddress = getToAddress()
    
        let options = {
          type: 'native',
          amount: Moralis.Units.ETH('0.01'),
          receiver: contractAddress,
        }
        const transaction = await Moralis.transfer(options)
        const receipt = await transaction.wait()
        console.log(receipt)
        saveTransaction(receipt.transactionHash, '0.01', receipt.to)
    }


    /* Calling the api route */
    const saveTransaction = async (txHash, amount, toAddress) => {
      await fetch('/api/swapTokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash,
          from: currentAccount,
          to: toAddress,
          amount: parseFloat(amount),
        }),
      })
    }

    const connectWallet = () => {
        authenticate()
    }
    
    const signOut = () => {
        console.log('Logged out')
        logout()
    }

    return (
        <RobinhoodContext.Provider
            value={{
                connectWallet,
                signOut,
                currentAccount,
                isAuthenticated,
                formattedAccount,
                setAmount,
                mint,
                setCoinSelect,
                coinSelect,
                balance,
                swapTokens,
                amount,
                toCoin,
                setToCoin,
            }}
        >
            {children}
        </RobinhoodContext.Provider>
    )
}