/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const setWithExpiry = (key: string, value: any, time: number) => {
	const now = new Date();

	const item = {
		value: value,
		expiry: now.getTime() + time,
	};

	localStorage.setItem("session_signature", JSON.stringify(item));
};

export const getWithExpiry = (key: string) => {
	const itemFromLocalStorage = localStorage.getItem("session_signature") || null;

	const item = JSON.parse(itemFromLocalStorage as string);

	const now = new Date();
	if (item) {
		if (now.getTime() > item.expiry) {
			localStorage.removeItem(key);
		}
	}
	return ((item as object) && (item.value as string)) || null;
};
