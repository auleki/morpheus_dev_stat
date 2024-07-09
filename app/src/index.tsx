import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi'
import { mainnet, arbitrum, sepolia, baseSepolia } from 'wagmi/chains'
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import ReactDOM, { createRoot } from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import './index.css';
import { MetaMaskProvider } from '@metamask/sdk-react';

import Dashboard from './components/views/Dashboard';
import { QrCodeModal } from './components/modals/QRCodeModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// WEB3 MODAL SETUP
const PROJECT_ID = 'bccf419f0906b20bba824f6703230bcf'

const metadata = {
  name: 'Morpheus Internal Statistics Management',
  description: 'A way to keep track of some vital morpheus statistics',
  url: 'localhost:3001',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum] as const

const config = defaultWagmiConfig({
  chains,
  projectId: PROJECT_ID,
  metadata
})

createWeb3Modal({
  defaultChain: mainnet,
  wagmiConfig: config,
  projectId: PROJECT_ID,
  enableAnalytics: true,
  enableOnramp: true
})


// DEFINE ROUTER 
const router = createHashRouter([
  {
    path: "/",
    element: <Dashboard />
  }
])

// Setup Query Client
const queryClient = new QueryClient()

// ABSTRACT ROOT COMPONENT
const AppRoot = () => {
  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false)


  return (
    <React.StrictMode>
      <MetaMaskProvider
        debug={true}
        sdkOptions={{
          dappMetadata: {
            name: 'Morpheus Internal',
            url: window.location.href
          },
          infuraAPIKey: '799617301a8446e9a7fb81a84ae23855',
          modals: {
            install: ({ link }) => {
              let modalContainer: HTMLElement;
              let ModalContainer: ReactDOM.Root;

              return {
                mount: link => {
                  if (modalContainer) return;
                  // console.log({ link })
                  modalContainer = document.createElement('div')
                  modalContainer.id = 'meta-mask-modal-container'

                  document.body.appendChild(modalContainer)

                  ModalContainer?.render(
                    <QrCodeModal
                      onClose={() => {
                        ModalContainer.unmount()
                        modalContainer.remove();
                      }}
                    />
                  )

                },
                unmount: () => {
                  if (modalContainer) {
                    ModalContainer.unmount()
                    modalContainer.remove();
                  }
                }
              }
            },
            otp: () => {
              return {
                updateOTPValue: otpValue => {
                  if (otpValue !== '') {
                    alert(`OTP is ${otpValue}`)
                  }
                }
              }
            }
          },

        }}
      >
        <RouterProvider router={router} />
      </MetaMaskProvider>
    </React.StrictMode>
  )
}

const rootEl = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootEl);
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  </WagmiProvider>
);