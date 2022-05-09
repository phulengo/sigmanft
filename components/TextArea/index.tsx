import { ChangeEventHandler } from "react";

type TextAreaProps = {
	required: boolean;
	placeholder?: string;
	value?: string;
	name?: string;
	onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
};

export const TextArea = ({ required, placeholder, value, name, onChange }: TextAreaProps) => {
	return (
		<textarea
			value={value}
			name={name}
			onChange={onChange}
			required={required}
			className="self-stretch"
			placeholder={placeholder}
		/>
	);
};
