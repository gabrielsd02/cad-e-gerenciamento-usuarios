export const api = async (url: string, options = {} as RequestInit) => {
	const baseURL = 'http://localhost:3001'; 
	const fullURL = `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`; 

	const defaultHeaders = {
		'Content-Type': 'application/json',
	};
	const headers = { ...defaultHeaders, ...(options.headers || {}) };
	
	try {
		const response = await fetch(fullURL, {
			...options,
			headers,
		});

		if(!response.ok) {
			return response.text().then(text => { throw new Error(text) });
		}
		return response.json();
	} catch(e: unknown) {
		console.error(e);
	}
	;
};