import Dexie, {type EntityTable} from 'dexie'
import {IWalletAddress, IActiveWallet} from "../../types/components";

const indexDBInstance = new Dexie('dev_internal') as Dexie & {
    wallets: EntityTable<IWalletAddress, 'id'>,
    activeWallet: EntityTable<IWalletAddress, 'id'>
}

indexDBInstance.version(1).stores({
    wallets: '++id, name, address, dateCreated',
    activeWallet: 'name, address, dateCreated',
})
export {indexDBInstance}
