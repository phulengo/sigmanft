import Image from "next/image";
import * as icons from "react-feather";

export type IconName = keyof typeof icons;

export type IconProps = {
	name?: IconName;
	hasPadding?: boolean;
} & icons.IconProps;

/** Got this from https://github.com/feathericons/react-feather/issues/41 */
export function Icon({ name, hasPadding, ...rest }: IconProps) {
	const IconComponent = icons[name!];
	return hasPadding ? (
		<div className="icon__padding">
			<IconComponent {...rest} />
		</div>
	) : (
		<IconComponent {...rest} />
	);
}

type IconWalletProps = {
	name: string;
	size?: string;
	className?: string;
};

export const IconWallet = ({ name, size, className }: IconWalletProps) => {
	return (
		<Image
			className={className}
			priority={false}
			src={`/${name}.svg`}
			width={size}
			height={size}
			alt={`${name}-logo`}
		/>
	);
};
