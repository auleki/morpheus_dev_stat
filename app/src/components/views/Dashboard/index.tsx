import './dashboard.css'
import GuestDashboard from './GuestDashboard'
import LoggedIn from './LoggedIn'
import { useAccount } from 'wagmi'
import {IWalletAddress} from "../../../../types/components";
import {useEffect, useState} from "react";
import {indexDBInstance as db} from "../../../db/db";
import {useLiveQuery} from "dexie-react-hooks";


const Dashboard = () => {
    const activeWallet = useLiveQuery(() => db.activeWallet.toArray())
    const {
        address, // 1
        isReconnecting,
        isConnected, // 2
        chain, // 3
        chainId, // 4
        isDisconnected,
        connector
    } = useAccount()
    const [pickedWallet, setPickedWallet] = useState<IWalletAddress>({} as IWalletAddress)
    
    const pickWallet = async (wallet: IWalletAddress) => {
        const cleared = await db.activeWallet.clear()
        const _pickedWallet = {
            name: wallet.name,
            dateCreated: wallet.dateCreated,
            address: wallet.address
        }
        const savedWallet = await db.activeWallet.add(_pickedWallet)
        setPickedWallet(wallet)
    }

    useEffect(() => {
        console.log({activeWallet})
    }, [activeWallet]);
    
    const changeWallet = () => db.activeWallet.clear()
    // @ts-ignore
    return (
       <div className='dashboard'>
        {
            isConnected 
                ? 
                <LoggedIn
                    chainID={chainId || 0}  
                    chain={chain}
                    isConnected={isConnected}
                    /> 
                : activeWallet?.length
                    ? <LoggedIn
                        pickedAddress={pickedWallet?.address}
                        changeWallet={changeWallet}
                        chainID={0}
                        chain={chain}
                        /> : <GuestDashboard pickWallet={pickWallet}/> 
        }
       </div>
    )
}

export default Dashboard