import { createContext, useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'

export const RobinhoodContext = createContext()

export const RobinhoodProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formattedAccount, setFormattedAccount] = useState('')

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