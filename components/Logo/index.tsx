import Image from "next/image";

type LogoProps = {
	width: string;
	height: string;
	className?: string;
	onClick?: () => void;
	theme?: string;
};

const Logo = ({ width, height, className, onClick, theme }: LogoProps) => {
	return (
		<Image
			onClick={onClick}
			className={className}
			priority={false}
			src={`/sigmanft-logo${theme == "white" ? "-white" : ""}.svg`}
			width={width}
			height={height}
			alt="sigmanft-logo"
		/>
	);
};

export default Logo;
