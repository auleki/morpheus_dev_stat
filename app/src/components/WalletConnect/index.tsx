export default function WalletConnect({ connectToWallet }: { connectToWallet: () => void }) {
    return (
        <div className='connect_buttons'>
            {/* Wallet Connect */}
            <button className="button solid" onClick={connectToWallet}>
                Connect Wallet
            </button>
        </div>
    )
}