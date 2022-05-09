type InputProps = {
	type: string;
	required: boolean;
	placeholder?: string;
	value?: string;
	name?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	pattern?: string;
	autocomplete?: string;
	className?: string;
	min?: number;
	step?: number;
};

export const Input = ({
	type,
	required,
	placeholder,
	value,
	name,
	onChange,
	pattern,
	autocomplete,
	className,
	min,
	step,
}: InputProps) => {
	return (
		<input
			value={value}
			/**
			 * https://www.chromium.org/developers/design-documents/create-amazing-password-forms/
			 */
			autoComplete={autocomplete}
			name={name}
			onChange={onChange}
			required={required}
			className={`${className as string}`}
			placeholder={placeholder}
			type={type}
			pattern={pattern}
			min={min}
			step={step}
		/>
	);
};
