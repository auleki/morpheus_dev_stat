import {useState} from 'react'

const useSmartContract = () => {
    const [data, setData] = useState<any>()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState([])

    // handle logic to readContract
    // pass in contract address, functionName, functionArguments, providerChain etc...    
    
    return {} // data that's required from contract
}

export default useSmartContract