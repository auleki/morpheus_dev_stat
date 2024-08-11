import NoWalletImg from "../../assets/no_wallet.png";
import {useEffect, useState} from "react";

export default function EmptyWalletAddresses () {
    const [playFloat, setPlayFloat] = useState(true)
    
    // Cleanup for floating animation
    useEffect(() => {
        setTimeout(() => setPlayFloat(false), 10000)
    }, []);
    return (
        <div className={"empty_wallet_addresses"}>
            <img className={`empty_wallet_address_image ${playFloat ? 'floating' : ''}`} src={NoWalletImg} alt={"no wallets"}/>
            <h2>No Wallet Addresses</h2>
        </div>
    )
}