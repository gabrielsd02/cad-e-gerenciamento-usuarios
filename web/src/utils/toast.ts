import { toast } from 'react-toastify';

export function returnToast(message: string, type: 'success' | 'error') {
	toast[type](message, {
		position: "top-right",
		autoClose: 4000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		progress: undefined,
		theme: "dark",
	});
}