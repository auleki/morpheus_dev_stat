import { ethers } from "ethers"
import { MOR_ABI } from "../abis/abi"
import { getMORPrice } from "../services/userInfo"
import { utils } from "web3"
import { ContractBalanceType, MORAddressType } from "../../types/utils"
import { ALCHEMY_API_KEY } from "./constants"

export const formatWalletAddress = (address: string) => {
    const firstHalf = address.split('').splice(0, 5).join('')
    const lastHalf = address.split('').splice(address.length - 5).join('')
    const formattedAddress = `${firstHalf}...${lastHalf}`
    return formattedAddress
}

export const convertWeiIntoETH = (weiBalance: number) => {
    const balanceInETH = utils.fromWei(weiBalance, 'ether')
    return {
        rawBalance: BigInt(weiBalance),
        formattedBalance: Number(balanceInETH).toFixed(4),
        balance: balanceInETH
    }
}


/**
 * 
 * @param userBalance reprents the balance of the user from smart contract
 * @param tokenPrice represent the current fiat value of MOR price
 * @returns 
 */
export const calculateTokenValue = (
    userBalance: number,
    tokenPrice: number) => {
    // convert raw balance to big int
    const { balance, rawBalance, formattedBalance } = convertWeiIntoETH(userBalance)
    // const balanceBigInt = BigInt(userBalance)
    // console.log({balance, rawBalance, formattedBalance})

    const fiatValue = Number(balance) * tokenPrice

    // console.log({fiatValue})

    return {
        fiatValue,
        formattedFiatValue: Number(fiatValue.toFixed(4)),
        tokenPrice,
    }
}

export const checkMORContractsForUserBalance = async (morPrice: number = 28.5, address: string = '0x6a7d9b0a21649c33b019baee7dac5ac358147f86') => {
    let totalBalance = 0
    const MOR_ADDRESSES: MORAddressType[] = [
        {
            network: 'arbitrum',
            address: '0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86',
            abi: MOR_ABI,
            chainID: 42161
        },
        {
            network: 'ethereum',
            address: '0xcBB8f1BDA10b9696c57E13BC128Fe674769DCEc0',
            abi: MOR_ABI,
            chainID: 1
        },
        {
            network: 'base',
            address: '0x7431ada8a591c955a994a21710752ef9b882b8e3',
            abi: MOR_ABI,
            chainID: 8453
        }
    ]
    let contractBalances: ContractBalanceType[] = []

    try {
        // loop through all 3 MOR contracts checking the balance of the user on each contract. 
        for (const deployedToken of MOR_ADDRESSES) {
            const provider = new ethers.AlchemyProvider(deployedToken.chainID, ALCHEMY_API_KEY)
            const contract = new ethers.Contract(deployedToken.address, deployedToken.abi, provider)
            // const res = await getMORPrice()
            const userBalance = await contract.balanceOf(address)
            // const userBalance = 11315396864899298817304
            const { fiatValue } = calculateTokenValue(userBalance, morPrice)
            contractBalances.push({
                network: deployedToken.network,
                balance: fiatValue,
            })
            totalBalance += fiatValue
        }
        return {
            contractBalances,
            totalBalance: Number(totalBalance.toFixed(4))
        }
    } catch (error) {
        // console error
        console.error(`Error checking MOR contracts:: `, error)
    }    
}
