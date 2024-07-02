import { ethers } from "ethers"
import { MOR_ABI } from "../abis/abi"
import { getMORPrice } from "../services/userInfo"
import { utils } from "web3"
import { ContractBalanceType, MORAddressType } from "../../types/utils"
import { ALCHEMY_API_KEY, MOR_ADDRESSES } from "./constants"

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
    const { balance } = convertWeiIntoETH(userBalance)

    const fiatValue = Number(balance) * tokenPrice
    return {
        fiatValue,
        formattedFiatValue: Number(fiatValue.toFixed(4)),
        tokenPrice,
    }
}

export const checkMORContractsForUserBalance = async (morPrice: number = 28.5, address: string = '0x6a7d9b0a21649c33b019baee7dac5ac358147f86') => {
    let totalBalance = 0
    
    let contractBalances: ContractBalanceType[] = []

    try {
        // loop through all 3 MOR contracts checking the balance of the user on each contract. 
        for (const deployedToken of MOR_ADDRESSES) {
            const provider = new ethers.AlchemyProvider(deployedToken.chainID, ALCHEMY_API_KEY)
            const contract = new ethers.Contract(deployedToken.address, deployedToken.abi, provider)
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
