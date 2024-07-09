import React, { useEffect, useState, ReactElement } from 'react'
import { checkMORContractsForUserBalance, convertWeiIntoETH } from '../../../utils/helper'
import { getMORPrice } from '../../../services/userInfo'
import { useSDK } from '@metamask/sdk-react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { DistributionABI } from '../../../abis/abi'
import { ALCHEMY_API_KEY, DISTRIBUTION_ADDRESS } from '../../../utils/constants'
import { ethers } from 'ethers'
import './dashboard.css'
import LogoImg from '../../../mor_logo_white.svg'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { ContractBalanceType } from '../../../../types/utils'
import WalletConnect from '../../WalletConnect'
import UserInfo from '../../UserInfo'
import { Chain } from 'viem'
// import { type LoggedInTypes } from '../../../../types/components'

type LoggedInTypes = {
    address: string |undefined;
    chainID: number;
    isConnected: boolean;
    chain: Chain | undefined;
}

export default function LoggedIn(props : LoggedInTypes):ReactElement<any> {
    const [account, setAccount] = useState<string>()
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
    //     address: '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790', Proxy of distributions <- use this! 
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

    const getMORPerDay = async () => {
        const provider = new ethers.AlchemyProvider(1, ALCHEMY_API_KEY)
        const contract = new ethers.Contract(
            '0x47176B2Af9885dC6C4575d4eFd63895f7Aaa4790', // Proxy Distribution.sol 💎
            // '0x4Df8bB964B7Dd0567508F0f228b76B883FC06bBD',
            DistributionABI,
            provider
        )

        const userData = await contract.usersData(address, 1)
        const balanceWeights = userData[1] // deposited[field]
        const poolsData = await contract.poolsData("1")
        const userWeight = ethers.formatUnits(balanceWeights, 0)// use formattedBalance variable
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
        const userReward = await contract.getCurrentUserReward(1, address) // (PoolID, UserAddress)
        const rewardBalance = convertWeiIntoETH(userReward)
        // console.log("ALCHI", { userReward: Number(userReward), userRewardType: typeof Number(userReward), rewardBalance })
        return rewardBalance

    }

    const balance = useBalance({ address })
    // const { walletInfo } = useWalletInfo()
    const { sdk, connected, connecting, ...restUseSdk } = useSDK()

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
        const fetchMORPrice = async () => {
            const res = await getMORPrice()
            const currentMORPrice = (res as any)?.usd

            await getCurrentReward()
            setMorPrice(currentMORPrice)
            const balances = await checkMORContractsForUserBalance(undefined, address)
            const dailyMOR = await getMORPerDay()
            setMorPerDay(dailyMOR)
            setClaimableMOR((balances?.totalBalance.toLocaleString()) || '0')
            setMorContractBalances(balances?.contractBalances || [])
        }
        fetchMORPrice()
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
        if (openModal) open({ view: 'Networks' })
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
                        <h1>Overview</h1>
                    </div>

                    <section className="contract_balances">
                        {morContractBalances.map(morContract => (
                            <div key={morContract.network} className='contract_balance'>
                                <h6 className='contract_balance_title'>{morContract.network.toUpperCase()}</h6>
                                <span className='contract_balance_value'>{morContract.balance}</span>
                            </div>
                        ))}
                    </section>

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