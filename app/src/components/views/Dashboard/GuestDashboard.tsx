import {useWeb3Modal} from "@web3modal/wagmi/react";
import WalletConnect from "../../WalletConnect";
import WalletAddress from "../../Dashboard/WalletAddress";
import List from "../../common/List/List";
import Button from "../../common/Button";
import React, {useState, useEffect} from "react";
import NewWalletForm from "../../Dashboard/NewWalletForm";
import {GuestDashboardProps, IWalletAddress, WalletAddressProps} from "../../../../types/components";
import {indexDBInstance as db} from '../../../db/db'
import {useLiveQuery} from "dexie-react-hooks";
import {PiXBold} from "react-icons/pi";
import {BiSolidMessageSquareAdd} from "react-icons/bi";
import EmptyWalletAddresses from "../../EmptyScreens/EmptyWalletAddresses";

export default function GuestDashboard({pickWallet}: GuestDashboardProps) {
    const friends = useLiveQuery(() => db.friends.toArray())
    const wallets = useLiveQuery(() => db.wallets.toArray())
    const activeWallet = useLiveQuery(() => db.activeWallet.toArray())
    const [walletNameInput, setWalletNameInput] = useState<string>('')
    const [walletAddressInput, setWalletAddressInput] = useState<'0x{string}' | undefined>(undefined)
    const [isAddingAddress, setIsAddingAddress] = useState(false)
    const [walletList, setWalletList] = useState<IWalletAddress[]>([])
    const [formError, setFormError] = useState('')
    const {open} = useWeb3Modal()

    function connectToWallet() {
        open()
    }

    useEffect(() => {
        loadWalletAddresses(wallets || [])
    }, [friends, wallets]);

    const updateWalletAddressInput = (e: any) => setWalletAddressInput(e.target.value)

    const updateWalletNameInput = (e: any) => setWalletNameInput(e.target.value)

    function showWalletAddForm() {
        setIsAddingAddress(true)
    }

    function cancelWalletAdd(): void {
        setIsAddingAddress(false)
        setFormError('')
    }

    function loadDashboard() {

    }


    async function addNewWallet(e: React.FormEvent) {
        // take input from inputs fields and create wallet object
        
        e.preventDefault()
        
        const newWallet: IWalletAddress = {
            name: walletNameInput,
            address: walletAddressInput,
            dateCreated: new Date(),
        }

        if (newWallet.name && newWallet.address) {
            try {
                const walletID = await db.wallets.add(newWallet)
                setIsAddingAddress(false)
            } catch (error) {
                console.log({error})
                setFormError('Other error occurred')
            }
        } else {
            // add error saying both
            setFormError('You need a wallet address and name, please fill in both fields')
            setTimeout(() => setFormError(''), 5000)
        }


        setWalletAddressInput(undefined)
        setWalletNameInput('')
    }

    async function deleteWalletAddress(id: number) {
        const removeAddress = await db.wallets.delete(id)
    }


    function loadWalletAddresses(wallets: IWalletAddress[]) {
        const orderedWallets = wallets.sort((a: IWalletAddress, b: IWalletAddress) => Number(b.dateCreated.getTime()) - Number(a.dateCreated.getTime()))
        console.log({orderedWallets, dates: wallets.map(wallet => wallet.dateCreated.getTime())})
        setWalletList(orderedWallets)
    }

    return (
        <div className="guest_dashboard">
            <h1 className="title">👋🏻Welc<span className="green_span">mor</span>.</h1>
            <span>Unlock Your Vital Statistics</span>
            <form className="wallet_addresses" onSubmit={e => addNewWallet(e)}>
                <div className="title_section">
                    {isAddingAddress ? (
                        <>
                            <h2>Add a New Wallet</h2>
                            <section className={"action_buttons"}>
                                <Button
                                    icon={<PiXBold/>}
                                    cancel={true}
                                    onClick={cancelWalletAdd}
                                    text={'Cancel'}
                                />
                                <Button
                                    icon={<BiSolidMessageSquareAdd size={16}/>}
                                    onClick={() => {}}
                                    text={'Save Wallet'}
                                    type={"submit"}
                                />
                            </section>
                        </>
                    ) : (
                        <>
                            <h2>Wallet Addresses</h2>
                            <Button onClick={showWalletAddForm} text={'Add Wallet'}/>
                        </>
                    )}
                </div>

                {isAddingAddress ? (
                    <NewWalletForm
                        error={formError}
                        nameValue={walletNameInput}
                        addressValue={walletAddressInput}
                        onAddressChange={updateWalletAddressInput}
                        onNameChange={updateWalletNameInput}
                    />
                ) : null}
                {wallets?.length ? (
                        <List space={1} size={500}>
                            {walletList.map(wallet => (
                                <WalletAddress
                                    id={wallet.id}
                                    pickWallet={pickWallet}
                                    address={wallet.address}
                                    loadDashboard={loadDashboard}
                                    name={wallet.name}
                                    deleteWalletAddress={deleteWalletAddress}
                                    dateCreated={wallet.dateCreated}
                                    key={wallet.id}
                                />
                            ))
                            }
                        </List>
                    )
                    : !isAddingAddress ? (
                        <EmptyWalletAddresses />
                    ) : null}
            </form>
        </div>
    )
}