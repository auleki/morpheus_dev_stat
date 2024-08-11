import { Chain } from "viem";
import {Dispatch, SetStateAction} from "react";

export type UserIProps = {
    userInfo: IUser
    logoutUser: () => Promise<void>;
    switchChainNetwork: () => Promise<void>;
    loading: boolean;
    network: string;
}

export interface IUser {
    balance?: string;
    address?: string;
}

// export type LoggedInTypes = {
//     address: string |undefined;
//     chainID: number | undefined;
//     isConnected: boolean;
//     chain: Chain | undefined;
// }

export type ButtonType = {
    onClick: () => void;
    type?: "button" | "submit" | "reset";
    icon?: any;
    text: string;
    cancel?: boolean;
}

export type InputProps = {
    label: string;
    autoFocus?: boolean;
    placeholder: string;
    value: string;
    onChange: (e) => void;
}

export type NewWalletProps = {
    addressValue: string | undefined;
    nameValue: string;
    onNameChange: Dispatch<SetStateAction<string>>;
    error: string;
    onAddressChange: Dispatch<SetStateAction<string>>;
}

export interface IWalletAddress {
    address: `0x{string}` | undefined;
    name: string;
    dateCreated: Date;
    id?: number;
}

export type WalletConnectProps = {
    connectToWallet: () => void;
    changeWallet: () => void;
}

export type WalletAddressProps = {
    address: string | undefined;
    name: string;
    pickWallet: (wallet: IWalletAddres) => void;
    loadDashboard: () => void;
    id: number | undefined;
    dateCreated: Date;
    deleteWalletAddress: (id: number) => void;
}

export interface IActiveWallet {
    activeWalletID: number | null;
    id: number | undefined;
}

export type LoggedInTypes = {
    pickedAddress?: `0x${string}`  |undefined;
    changeWallet?: () => void;
    chainID?: number;
    isConnected?: boolean;
    chain?: Chain | undefined;
}
export type GuestDashboardProps = {
    pickWallet: (wallet: IWalletAddress) => void;
}

export type FormErrorProps = {
    message: string;
}