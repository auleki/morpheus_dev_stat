import {InputProps} from '../../../types/components'
export default function Input({label, placeholder, value, onChange, autoFocus}: InputProps) {
    return (
        <section className="input_group">
            <label htmlFor={label.toLowerCase()}>{label}</label>
            <input 
                type="text" 
                autoFocus={autoFocus}
                onChange={onChange}
                placeholder={placeholder} 
                value={value}/>
        </section>
    )
}