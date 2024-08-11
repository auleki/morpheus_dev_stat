import React, {ReactElement, useEffect, useState} from 'react'
import {checkMORContractsForUserBalance, convertWeiIntoETH} from '../../../utils/helper'
import {getMORPrice} from '../../../services/userInfo'
import {useSDK} from '@metamask/sdk-react'
import {useAccount, useBalance, useDisconnect} from 'wagmi'
import {DistributionABI} from '../../../abis/abi'
import {ALCHEMY_API_KEY, DISTRIBUTION_ADDRESS} from '../../../utils/constants'
import {ethers} from 'ethers'
import './dashboard.css'
import LogoImg from '../../../mor_logo_white.svg'
import {useWeb3Modal} from '@web3modal/wagmi/react'
import {PiQrCodeFill} from "react-icons/pi";
import {ContractBalanceType} from '../../../../types/utils'
import WalletConnect from '../../WalletConnect'
import UserInfo from '../../UserInfo'
import {IWalletAddress, LoggedInTypes} from "../../../../types/components";
import {useLiveQuery} from "dexie-react-hooks";
import {indexDBInstance as db} from "../../../db/db";


export default function LoggedIn(props: LoggedInTypes): ReactElement<any> {
    // const [account, setAccount] = useState<string>(
    const activeWallet = useLiveQuery(() => db.activeWallet.toArray())
    const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | undefined>(props.pickedAddress)
    const [morPerDay, setMorPerDay] = useState<string>('')
    const [selectedNetwork, setSelectedNetwork] = useState<string>('')
    const [morContractBalances, setMorContractBalances] = useState<ContractBalanceType[]>([])
    const [claimableMOR, setClaimableMOR] = useState<string>('0')
    const [headerDate, setHeaderDate] = useState({} as {
        year: string;
        month: string;
        day: string;
        date: string
    })
    const [morPrice, setMorPrice] = useState(0);
    const [currentWeightReward, setCurrentWeightReward] = useState<number>(0)
    const [currentWallet, setCurrentWallet] = useState<IWalletAddress>({} as IWalletAddress)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [network, setNetwork] = useState<string>('')
    const {close, open} = useWeb3Modal()
    const {disconnect, status} = useDisconnect()
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
    //     address: '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790', Proxy of distributions <- use this! 
    //     functionName: "getCurrentUserReward",
    //     args: [0, '0xe9EDa9585b6C917E7FAc1C0AD9724faB609491DC'],
    //     account: '0xe9EDa9585b6C917E7FAc1C0AD9724faB609491DC',
    // }

    useEffect(() => {
        if (activeWallet) {
            setSelectedAddress(activeWallet[0].address)
        } else if (props.pickedAddress) {
            console.log({pickedAddy: props.pickedAddress})
            setSelectedAddress(props.pickedAddress)
        } else {
            console.log({giveAddress: address})
            setSelectedAddress(address)
        }
    }, [selectedAddress, activeWallet]);

    useEffect(() => {
        setCurrentWallet(activeWallet?.[0] ?? {} as IWalletAddress)
    }, [activeWallet]);

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

    const getMORPerDay = async () => {
        // const provider = new ethers.Contract()
        const provider = new ethers.AlchemyProvider(1, ALCHEMY_API_KEY)
        const contract = new ethers.Contract(
            '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790', // Proxy Distribution.sol 💎
            // '0x4Df8bB964B7Dd0567508F0f228b76B883FC06bBD',
            DistributionABI,
            provider
        )

        const userData = await contract.usersData(selectedAddress, 1)
        const balanceWeights = userData[1] // deposited[field]
        const poolsData = await contract.poolsData("1")
        const userWeight = ethers.formatUnits(balanceWeights, 0)// use formattedBalance variable
        setCurrentWeightReward(Number(userWeight))
        const pools = await contract.pools("1")
        const initialReward = convertWeiIntoETH(pools[5]) // initial reward to pool
        const decrease = convertWeiIntoETH(pools[6])    // reward decrease rate to pool
        const todayTimestamp = new Date().getTime() / 1000
        const startTime = pools[0] // payoutStart for pool
        const interval = pools[1] // payout interval for pool
        const daysDecrease = Math.floor((todayTimestamp - Number(startTime)) / Number(interval))
        const currentReward = Number(initialReward.formattedBalance) - (Number(decrease.formattedBalance) * daysDecrease)
        const totalWeights = Number(poolsData[2])
        const morPERDay = ((Number(userWeight) / totalWeights) * currentReward).toFixed(4)

        if (Number(morPERDay) <= 0) return '0'

        return morPERDay
    }

    // Read Morpheus Contracts
    const getCurrentReward = async () => {
        // 0x6a7d9b0a21649c33b019baee7dac5ac358147f86: GOLDEN_WALLET
        const provider = new ethers.AlchemyProvider(1, ALCHEMY_API_KEY)
        const contract = new ethers.Contract(
            DISTRIBUTION_ADDRESS, // Distribution.sol 💎
            // '0x4Df8bB964B7Dd0567508F0f228b76B883FC06bBD',
            DistributionABI,
            provider
        )
        const userReward = await contract.getCurrentUserReward(1, selectedAddress) // (PoolID, UserAddress)
        return convertWeiIntoETH(userReward)
    }

    const balance = useBalance({address: selectedAddress})
    // const { walletInfo } = useWalletInfo()
    const {sdk, connected, connecting, ...restUseSdk} = useSDK()

    useEffect(() => {
        switchChainNetwork()
    }, [chainId])

    /**
     * Handles fetching the current price of MOR, also gets the current weight
     * and claimable MOR from all contracts assigned to user's wallet address
     */
    useEffect(() => {
        setDefaultNetwork()
        const todayDate = initializeDate()
        setHeaderDate(todayDate)
        // if (selectedAddress)
        if (selectedAddress) {
            const fetchMORPrice = async () => {
                const res = await getMORPrice()
                const currentMORPrice = (res as any)?.usd

                const reward = await getCurrentReward()
                setMorPrice(currentMORPrice)
                const balances = await checkMORContractsForUserBalance(undefined, selectedAddress)
                const dailyMOR = await getMORPerDay()
                setMorPerDay(dailyMOR)
                setClaimableMOR(String(reward.balance))
                // setClaimableMOR((balances?.totalBalance.toLocaleString()) || '0')
                setMorContractBalances(balances?.contractBalances || [])
            }
            fetchMORPrice()
        }
        
    }, [])

    const DASH_STATS = [
        {
            stat: 'MOR Price',
            value: morPrice,
            sign: "MOR",
            signAfter: true
        },
        {
            stat: 'Claimable MOR',
            value: claimableMOR,
            sign: "MOR",
            signAfter: true
        },
        {
            stat: 'Current Weight',
            value: currentWeightReward,
            sign: "WEIGHT",
            signAfter: true
        },
        {
            stat: 'MOR per day',
            value: morPerDay,
            sign: "MOR",
            signAfter: true
        },

    ]

    // Use the default network passed from useAccount() hook
    function setDefaultNetwork() {
        setNetwork(chain?.name || '')
    }

    // Change the chain network
    async function switchChainNetwork(openModal: boolean = false) {
        // If the open modal flag is not passed, the modal does not opem.
        if (openModal) open({view: 'Networks'})
        setNetwork(chain?.name || 'ethereum')
    }

    async function logoutUser() {
        setIsLoading(true)
        disconnect()
        setIsLoading(false)
    }

    async function connectToWallet() {
        // opens a modal to connect a wallet
        open()
    }

    return (
        <div>
            <header className='header'>
                <section className='top_navbar'>
                    <img src={LogoImg}/>
                    {isConnected
                        ? (<UserInfo
                            userInfo={{balance: balance?.data?.formatted, address: selectedAddress}}
                            logoutUser={logoutUser}
                            loading={isLoading}
                            network={network}
                            switchChainNetwork={() => switchChainNetwork(true)}
                        />)
                        : (
                            <div className="wallet_data_section">
                                {currentWallet.name ? (
                                    <section className={"wallet_data"}>
                                        <h5 className={"space_between flex items_center"}>
                                            <span className={"wallet_address_icon"}><PiQrCodeFill /></span>
                                            <span>{currentWallet?.address}</span>
                                        </h5>
                                        <span className={"wallet_name"}>{currentWallet?.name}</span>
                                    </section>
                                ) : null }
                                <WalletConnect
                                    changeWallet={props.changeWallet || (() => {
                                    })}
                                    connectToWallet={connectToWallet}
                                />
                            </div>
                        )}
                    {/* : (<WalletConnect
                            connectToWallet={connectToWallet}
                        />)}
                        */}
                </section>

                <section className='bottom_navbar'>
                    <div>
                        <h1>Overview</h1>
                    </div>

                    <section className="contract_balances">
                        {morContractBalances.map(morContract => (
                            <div key={morContract.network} className='contract_balance'>
                                <section className="contract_balance_header">
                                    <h6 className='contract_balance_title'>{morContract.network.toUpperCase()}</h6>
                                    <img className="contract_icon" src={morContract.logoImg} alt={"token icon"}/>
                                </section>
                                <span className='contract_balance_value'>{morContract.balance}</span>
                            </div>
                        ))}
                    </section>

                    {/* Date Component */}
                    <div className='date_text'>
                        <span className='day'>{headerDate?.day}</span>
                        <section>
                            <span className='date'>{headerDate?.date} {headerDate?.month} <span
                                className='year'>{headerDate?.year}</span></span>
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
                            <span className='price'>{Number(claimableMOR).toFixed(6)}<span className='currency'>MOR</span></span>
                        </section>
                    </div>

                    {/* Statistic Card */}
                    <div className='stat_card'>
                        <section className='title'>
                            <span>MOR per day</span>
                        </section>
                        <section className='value'>
                            <span className='price'>{morPerDay}<span className='currency'>MOR</span></span>
                        </section>
                    </div>
                </section>
            </main>
        </div>
    )
}