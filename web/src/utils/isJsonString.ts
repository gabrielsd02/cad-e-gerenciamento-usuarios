export function isJsonString(str: string) {
	try {
			JSON.parse(str);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e: unknown) {
			return false;
	}
	return true;
}