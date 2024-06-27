import { useEffect, useState } from 'react'
import { UserIProps } from '../../../types/components'
import { formatWalletAddress } from '../../utils/helper'
import './userinfo.css'

export default function UserInfo
    ({ 
        userInfo, 
        logoutUser, 
        loading, 
        switchChainNetwork,
        network
    }: UserIProps) {
    return (
        <div className='user_info'>
            <button className='button solid' onClick={switchChainNetwork}>
                {network}
            </button>
            <p title={userInfo?.address} className='banner'>{formatWalletAddress(userInfo?.address || '')}</p>

            {/* Logout User */}
            <button
                className='button outline'
                onClick={logoutUser}>
                {loading ? "..." : "Logout"}
            </button>
        </div>
    )
}