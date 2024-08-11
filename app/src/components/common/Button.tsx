import {ButtonType} from "../../../types/components";

const Button = ({ onClick, text, cancel, icon, type }: ButtonType) => {
    return (
        <button
            type={type ?? "button"}    
            className={`button ${cancel ? 'cancel': 'solid'}`} 
            onClick={onClick}
        >
            <span className="button_text">{text}</span>
            {icon ? <span className="button_icon">{icon}</span> : null}
        </button>
    )
}

export default Button