export type UserIProps = {
    userInfo: IUser
    logoutUser: () => Promise<void>;
    switchChainNetwork: () => Promise<void>;
    loading: boolean;
    network: string
}

export interface IUser {
    balance?: string,
    address?: string
}