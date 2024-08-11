import './index.css'
import {IWalletAddress, WalletAddressProps} from "../../../types/components";
import {PiTrashSimple} from 'react-icons/pi'
export default function WalletAddress({name, address, dateCreated, id, deleteWalletAddress, loadDashboard, pickWallet}: WalletAddressProps) {
    const wallet = {
        name,
        address,
        dateCreated,
        id,
    }
    return (
        <div className={'wallet_address_section'}>
            <section>
                <p>Name</p>
                <p className={"wallet_name"}>{name}</p>
            </section>
            
            <section>
                <p>Address</p>
                <p className="wallet_address" onClick={() => pickWallet(wallet)}>{address}</p>
            </section>
            
            <section>
                <p>Date Added</p>
                <p>{dateCreated.toDateString()}</p>
            </section>

            {id ? (
                <section className='action_buttons'>
                    <button
                        className="icon_button"
                        onClick={() => deleteWalletAddress(id)}>
                        <PiTrashSimple />
                    </button>
                </section>
            ) : null}
        </div>
    )
}