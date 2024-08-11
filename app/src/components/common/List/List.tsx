import React from 'react'
import './list.css'
export default function List({children, space = 3, size = 100}: {children: React.ReactNode, space: number, size: number}) {

    return (
        <div style={{gap: space + 'rem', height: size + 'px'}} className="scrollable list_section">
            {children}
        </div>
    )
}