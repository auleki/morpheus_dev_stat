import './dashboard.css'
import GuestDashboard from './GuestDashboard'
import LoggedIn from './LoggedIn'
import { useAccount } from 'wagmi'



const Dashboard = () => {
    const {
        address, // 1
        isReconnecting,
        isConnected, // 2
        chain, // 3
        chainId, // 4
        isDisconnected,
        connector
    } = useAccount()
    return (
       <div className='dashboard'>
        {
            isConnected 
                ? 
                <LoggedIn
                    address={address} 
                    chainID={chainId || 0}  
                    chain={chain}
                    isConnected={isConnected}
                    /> 
                : <GuestDashboard />
        }
       </div>
    )
}

export default Dashboard