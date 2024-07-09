import { MORAddressType } from "../../types/utils"
import { MOR_ABI } from "../abis/abi"

export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY
export const DISTRIBUTION_ADDRESS = '0x24C09A0C047e8A439f26682Ea51c7157b3cCc20b'
export const MOR_ADDRESSES: MORAddressType[] = [
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

export const DASH_STATS = [
    {
        stat: 'Claimable MOR',
        value: "",
        sign: "MOR",
        isCurrency: false
    }
]