import Image from "next/image";

type AvatarProps = {
	src: string;
	size?: string;
	alt?: string;
	className?: string;
	style?: string;
};

export const Avatar = ({ src, size, alt, className, style }: AvatarProps) => {
	return (
		<>
			{src !== "" ? (
				<div
					className={`${className as string} avatar__wrapper`}
					style={{ width: `${size as string}px`, height: `${size as string}px` }}
				>
					<Image
						className={`${className as string} avatar`}
						src={src}
						layout="responsive"
						width={(+size! - 8) as unknown as string}
						height={(+size! - 8) as unknown as string}
						alt={alt}
						priority={false}
						objectFit="cover"
					/>
				</div>
			) : style ? (
				<>
					<div className="avatar-default__wrapper">
						<div
							className={`${className as string} avatar-default`}
							style={{
								width: `${(+size! - 8) as unknown as string}px`,
								height: `${(+size! - 8) as unknown as string}px`,
								background: `${style}`,
							}}
						/>
					</div>
				</>
			) : (
				<> </>
			)}
		</>
	);
};
