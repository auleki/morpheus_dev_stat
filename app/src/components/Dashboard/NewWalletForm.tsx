import Input from "../Form/Input";
import {NewWalletProps} from "../../../types/components";
import FormError from "../common/Error/FormError";

export default function NewWalletForm({ nameValue, addressValue, onNameChange, onAddressChange, error }: NewWalletProps) {
    return (
        <div className={"new_wallet_form"}>
            <Input 
                label={'Name'} 
                placeholder={'Wallet Type'} 
                value={nameValue} 
                autoFocus={true}
                onChange={onNameChange} />
            <Input
                label={'Address'}
                placeholder={'0x _ _ _ _ _'} 
                autoFocus={false}
                value={addressValue ?? ''} 
                onChange={onAddressChange} />
            {error ? <FormError message={"You need a wallet address and a name for your entry"}/> : null}
        </div>
    )
}