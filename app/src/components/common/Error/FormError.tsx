import {FormErrorProps} from "../../../../types/components";

export default function FormError({message}: FormErrorProps) {
    return (
        <section className={"error"}>
            <span className={"error_message"}>{message}</span>
        </section>
    )
}