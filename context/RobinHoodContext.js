import { createContext, useEffect, useState } from 'react'
import { useMoralis } from 'react-moralis'

export const RobinhoodContext = createContext()

export const RobinhoodProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formattedAccount, setFormattedAccount] = useState('')

    /* Moralis always listens in the backend for authentication activity */
    const { isAuthenticated, authenticate, user, logout, Moralis, enableWeb3 } = useMoralis()

    useEffect(() => {
        if (isAuthenticated) {
          const account = user.get('ethAddress')
          let formatAccount = account.slice(0, 4) + '...' + account.slice(-4)
          setFormattedAccount(formatAccount)
          setCurrentAccount(account)
        }
    }, [isAuthenticated, enableWeb3])

    /* If the user is logging in for the 1st time we want to create that user in sanity DB */
     useEffect(() => {
         if (!currentAccount) return
      
         ;(async () => {
           const response = await fetch('/api/createUser', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               walletAddress: currentAccount,
             }),
           })()
  
           const data = await response.json()
         })
     }, [currentAccount])
    

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