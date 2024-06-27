import axios from 'axios'

export async function getMORPrice() {
    try {
        const options = {
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'CG-c59caJj7472Wo4WMM4G913en'
            }
        }
        const PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=0x092baadb7def4c3981454dd9c0a0d7ff07bcfc86&vs_currencies=usd'
        const res = await axios.get(PRICE_API_URL, options)
        const dataKeys = Object.values(res.data)
        // console.log("FETCH PRICE", dataKeys?.[0])
        return dataKeys?.[0]
    } catch (error) {
        console.error(`Error getting more price`, error)
    }
}

export async function getUserWeights() {
    try {

    } catch (error) {

    }
}

export async function getUserClaimableMOR() {
    try {
        //
    } catch (error) {

    }
}