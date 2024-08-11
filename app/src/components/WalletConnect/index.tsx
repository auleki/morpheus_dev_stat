import { PiVaultFill } from "react-icons/pi";
import { IoIosWallet } from "react-icons/io";
import {WalletConnectProps} from "../../../types/components";
import Button from '../common/Button'

export default function WalletConnect({ connectToWallet, changeWallet}: WalletConnectProps) {
    return (
        <div className='connect_buttons'>
            {/* Wallet Connect */}
            {/*<button className="button solid" onClick={connectToWallet}>*/}
            {/*    Connect Wallet*/}
            {/*</button>*/}
            
            <Button onClick={changeWallet} text={"Change Wallet"} icon={<IoIosWallet />}/>
        </div>
    )
}