/**
 * https://stackoverflow.com/questions/9553354/how-do-i-get-the-decimal-places-of-a-floating-point-number-in-javascript
 */
export const countDecimals = (value: number) => {
	if (value.toString().includes(".")) {
		return value.toString().split(".")[1].length;
	} else {
		return 0;
	}
};
