export const api = (url: string, options = {} as RequestInit) => {
	const baseURL = 'http://localhost:3001'; 
	const fullURL = `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`; 

	const defaultHeaders = {
		'Content-Type': 'application/json',
	};
	const headers = { ...defaultHeaders, ...(options.headers || {}) };
	
	return fetch(fullURL, {
		...options,
		headers,
	})
		.then(response => {			
			if (!response.ok) {
				return response.json().then(errorData => {
          throw new Error(JSON.stringify(errorData)); // Passa os detalhes do erro
        });
			}
			return response.json(); 
		})
		.catch(error => {
			console.error('Erro na requisição:', error);
			throw error;
		})
	;
};