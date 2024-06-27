
import { useEffect, useState } from 'react';
import './dashboard.css'
// import Web3 from 'web3'
import LogoImg from '../../../mor_logo_white.svg'
import { useSDK } from '@metamask/sdk-react';
import { MetaMaskInpageProvider } from "@metamask/providers"
import { useAccount, useBalance, useDisconnect, useReadContract, UseReadContractParameters } from 'wagmi'
import { WalletConnectModal } from '@walletconnect/modal';
import { useWeb3Modal, useWalletInfo } from '@web3modal/wagmi/react'
import UserInfo from '../../UserInfo';
import { DistributionABI } from '../../../abis/abi';
import WalletConnect from '../../WalletConnect';
import { ethers } from 'ethers'
import { createPublicClient, http } from 'viem'
import { mainnet, mainnet as mainnetViem } from 'viem/chains'
import Web3 from 'web3';
import { getMORPrice } from '../../../services/userInfo';
import { calculateTokenValue, checkMORContractsForUserBalance } from '../../../utils/helper';
import { ALCHEMY_API_KEY, SAMPLE_WALLET_ADDRESS } from '../../../utils/constants';


const Dashboard = () => {
    const [account, setAccount] = useState<string>()
    const [selectedNetwork, setSelectedNetwork] = useState<string>('')
    const [claimableMOR, setClaimableMOR] = useState<string>('0')
    const [headerDate, setHeaderDate] = useState({} as {
        year: string;
        month: string;
        day: string;
        date: string
    })
    const [morPrice, setMorPrice] = useState(0);
    const [currentWeightReward, setCurrentWeightReward] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [network, setNetwork] = useState<string>('')
    const { close, open } = useWeb3Modal()
    const { disconnect, status } = useDisconnect()
    const {
        address,
        isReconnecting,
        isConnected,
        chain,
        chainId,
        isDisconnected,
        connector
    } = useAccount()

    // const params = {
    //     abi: distributionABI as any,
    //     address: '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790',
    //     functionName: "getCurrentUserReward",
    //     args: [0, '0xe9EDa9585b6C917E7FAc1C0AD9724faB609491DC'],
    //     account: '0xe9EDa9585b6C917E7FAc1C0AD9724faB609491DC',
    // }

    const initializeDate = () => {
        const newDate = new Date().toDateString()
        const [dayString, month, dayInt, year] = newDate.split('/').join('').split(' ')
        return {
            year,
            day: dayString,
            date: dayInt,
            month
        }
    }

    // Read Morpheus Contracts
    const getContractDataWithAlchemy = async () => {
        // 0x6a7d9b0a21649c33b019baee7dac5ac358147f86: GOLDEN_WALLET
        const provider = new ethers.AlchemyProvider(1, ALCHEMY_API_KEY)
        const contract = new ethers.Contract(
            '0x24C09A0C047e8A439f26682Ea51c7157b3cCc20b', // User wallet 🏦
            // '0x4Df8bB964B7Dd0567508F0f228b76B883FC06bBD',
            DistributionABI,
            provider
        )
        const userReward = await contract.getCurrentUserReward(1, SAMPLE_WALLET_ADDRESS)
        // const pools = await contract.poolsData(1)
    
        console.log("ALCHI", { contract, userReward: Number(userReward), userRewardType: typeof userReward })
    }

    const balance = useBalance({ address })
    // const { walletInfo } = useWalletInfo()
    const { sdk, connected, connecting, ...restUseSdk } = useSDK()

    useEffect(() => {
        switchChainNetwork()
    }, [chainId])

    /**
     * Handles fetching the current price of MOR, also gets the current weight and claimable MOR assigned to wallet address
     */
    useEffect(() => {
        setDefaultNetwork()
        const todayDate = initializeDate()
        setHeaderDate(todayDate)
        const fetchMORPrice = async () => {
            const res = await getMORPrice()
            const currentMORPrice = (res as any)?.usd

            await getContractDataWithAlchemy()
            // const {actua} = calculateTokenValue(Number(currentMORPrice))
            setMorPrice(currentMORPrice)
            // setClaimableMOR(fiatValueFormatted)
            const balances = await checkMORContractsForUserBalance()
            console.log("BALANCES[]", balances)
            setClaimableMOR((balances?.totalBalance.toLocaleString()) || '0')
            // calculate total
            // const totalBalance = balances?.contractBalances
            // console.log({totalBalance});
            
        }
        fetchMORPrice()
    }, [])

    // Use the default network passed from useAccount() hook
    function setDefaultNetwork() {
        setNetwork(chain?.name || '')
    }

    // Change the chain network
    async function switchChainNetwork(openModal: boolean = false) {
        // If the open modal flag is not passed, the modal does not opem.
        if (openModal) open({ view: 'Networks' })
        setNetwork(chain?.name || 'ethereum')
    }

    async function logoutUser() {
        setIsLoading(true)
        disconnect()
        setIsLoading(false)
    }

    function waitForEthereum() {
        return new Promise<void>((resolve) => {
            if (typeof window.ethereum !== 'undefined') {
                resolve();
            } else {
                window.addEventListener('ethereum#initialized', () => {
                    resolve();
                }, { once: true });
                setTimeout(resolve, 3000); // Timeout after 3 seconds
            }
        });
    }

    async function connectToWallet() {
        // opens a modal to connect a wallet
        open()
    }

    return (
        <div className="dashboard">
            <header className='header'>
                <section className='top_navbar'>
                    <img src={LogoImg} />                   
                    {isConnected
                        ? (<UserInfo
                            userInfo={{ balance: balance?.data?.formatted, address }}
                            logoutUser={logoutUser}
                            loading={isLoading}
                            network={network}
                            switchChainNetwork={() => switchChainNetwork(true)}
                        />)
                        : (<WalletConnect
                            connectToWallet={connectToWallet}
                        />)}
                </section>

                <section className='bottom_navbar'>
                    <div>
                        <h1>Overview 🗼</h1>
                        <span className='navbar_subtitle'>Evaluate your basic stats to know what you have</span>
                    </div>

                    {/* Date Component */}
                    <div className='date_text'>
                        <span className='day'>{headerDate?.day}</span>
                        <section>
                            <span className='date'>{headerDate?.date} {headerDate?.month} <span className='year'>{headerDate?.year}</span></span>
                        </section>
                    </div>
                </section>
            </header>

            {/* Main Content */}
            <main>
                <section className='stat_cards'>
                    {/* Statistic Card */}
                    <div className='stat_card'>
                        <section className='title'>
                            <span>MOR Price</span>
                        </section>
                        <section className='value'>
                            <span className='price'>${morPrice}</span>
                        </section>
                    </div>

                    {/* Statistic Card */}
                    <div className='stat_card'>
                        <section className='title'>
                            <span>Current Weight</span>
                        </section>
                        <section className='value'>
                            <span className='price'>{currentWeightReward}</span>
                        </section>
                    </div>

                    {/* Statistic Card */}
                    <div className='stat_card'>
                        <section className='title'>
                            <span>Claimable MOR</span>
                        </section>
                        <section className='value'>
                            <span className='price'>{claimableMOR}<span className='currency'>MOR</span></span>
                        </section>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Dashboard