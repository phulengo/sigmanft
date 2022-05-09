export const formatAvatarStyle = (style: string) => {
	return style.replaceAll("{", "").replaceAll("}", "").replace(`"background":`, "").replaceAll('"', "");
};
