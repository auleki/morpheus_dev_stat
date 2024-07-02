import { MORAddressType } from "../../types/utils"
import { MOR_ABI } from "../abis/abi"

export const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY
// export const SAMPLE_WALLET_ADDRESS = '0xe9EDa9585b6C917E7FAc1C0AD9724faB609491DC'
export const SAMPLE_WALLET_ADDRESS = '0x8bfa2307c282f114f4f3384fe88957eb4ed47588'
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