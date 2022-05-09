type InputProps = {
	required: boolean;
	placeholder?: string;
	name: string;
	value?: string;
	onChange: React.ChangeEventHandler;
	defaultValue?: string | number | readonly string[] | undefined;
	children: React.ReactNode;
};

export const Select = ({ name, value, required, placeholder, onChange, defaultValue, children }: InputProps) => {
	return (
		<select
			defaultValue={defaultValue}
			name={name}
			value={value}
			onChange={onChange}
			required={required}
			placeholder={placeholder}
		>
			{children}
		</select>
	);
};
