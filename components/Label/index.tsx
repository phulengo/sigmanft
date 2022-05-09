type LabelProps = {
	children: string;
	optional?: boolean;
	optionalText?: string;
	size: string;
	className?: string;
};

export const Label = ({ children, size, optional, optionalText, className }: LabelProps) => {
	return optional ? (
		<div className={`flex w-full justify-between items-center ${size} ${className as string}`}>
			<p className="font-semi-bold">{children}</p>
			<p className="font-semi-bold text-sonic-silver">{optionalText ? optionalText : "Optional"}</p>
		</div>
	) : (
		<div className={`flex w-full items-center ${size} ${className as string}`}>
			<p className="font-semi-bold">{children}</p>
		</div>
	);
};
