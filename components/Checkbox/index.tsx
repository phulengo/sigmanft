type CheckboxProps = {
	children: React.ReactNode;
	name: string;
	className?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	value?: string;
};

export const Checkbox = ({ name, children, className, onChange, value }: CheckboxProps) => {
	return (
		<div className={`${className as string} checkbox`}>
			<input value={value} onChange={onChange} name={name} type={"checkbox"} />
			{children}
		</div>
	);
};
