export const formatAvatarStyle = (style: string) => {
	return style.replace(/{/g, "").replace(/}/g, "").replace(`"background":`, "").replace(/"/g, "");
};
