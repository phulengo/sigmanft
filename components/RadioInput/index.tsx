type RadioInputProps = {
	children: React.ReactNode;
	name: string;
	className?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	value?: string;
};

export const RadioInput = ({ name, children, className, onChange, value }: RadioInputProps) => {
	return (
		<div className={`${className as string} radio`}>
			<input value={value} onChange={onChange} name={name} type={"radio"} />
			{children}
		</div>
	);
};
