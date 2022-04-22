import Image from "next/image";

type LogoProps = {
	width: string;
	height: string;
	className?: string;
};

const Logo = ({ width, height, className }: LogoProps) => {
	return (
		<Image
			className={className}
			priority={false}
			src="/sigmanft-logo.svg"
			width={width}
			height={height}
			alt="sigmanft-logo"
		/>
	);
};

export default Logo;
