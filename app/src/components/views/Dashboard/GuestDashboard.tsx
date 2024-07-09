import { useWeb3Modal } from "@web3modal/wagmi/react";
import WalletConnect from "../../WalletConnect";

export default function GuestDashboard () {
    const {open} = useWeb3Modal()
    function connectToWallet () {
        open()
    }
    return (
        <div className="guest_dashboard">
            <h1 className="title">👋🏻Welc<span className="green_span">mor</span>.</h1>
            <span>Unlock Your Vital Statistics</span>
            <WalletConnect  connectToWallet={connectToWallet}/>
        </div>
    )
}