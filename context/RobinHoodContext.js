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

    const requestToCreateUserProfile = async (walletAddress) => {
      try {
        console.log('Creating Sanity User..', '🤖')

        await fetch(`/api/createUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: walletAddress,
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
            }}
        >
            {children}
        </RobinhoodContext.Provider>
    )
}