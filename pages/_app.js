import '../styles/globals.css'
import { RobinhoodProvider } from '../context/RobinHoodContext'
import { MoralisProvider } from 'react-moralis'

function MyApp({ Component, pageProps }) {
    return(
      <MoralisProvider
        serverUrl='https://frav6pbipqso.usemoralis.com:2053/server'
        appId='EoxjtE0tkdWNEmJjzQcRSfnpekztQl7aeEFe0cxG'
      >
        <RobinhoodProvider>
          <Component {...pageProps} />
        </RobinhoodProvider>
      </MoralisProvider>
     
    ) 
}

export default MyApp
