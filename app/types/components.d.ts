import { Chain } from "viem";

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

export type LoggedInTypes = {
    address: string |undefined;
    chainID: number | undefined;
    isConnected: boolean;
    chain: Chain | undefined;
}