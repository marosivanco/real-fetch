import fetchWithTimeout from "./timeout";

const interceptors = [];

function intercept(fetch, ...args) {
	let chain = Promise.resolve(args);

	// chain request interceptors
	interceptors.forEach(({ request, requestError }) => {
		if (request || requestError) {
			chain = chain.then(
				request ? args => request(...args) : undefined,
				requestError ? e => requestError(e, ...args) : undefined,
			);
		}
	});

	// chain fetch call
	chain = chain.then(args => {
		const config = args[1];
		return config && config.timeout ? fetchWithTimeout(fetch, ...args) : fetch(...args);
	});

	// chain response interceptors
	interceptors.forEach(({ response, responseError }) => {
		if (response || responseError) {
			chain = chain.then(
				response ? r => response(r, ...args) : response,
				responseError ? e => responseError(e, ...args) : undefined,
			);
		}
	});

	return chain;
}
function addInterceptor(interceptor) {
	interceptors.push(interceptor);
	return () => {
		const index = interceptors.indexOf(interceptor);
		if (index >= 0) {
			interceptors.splice(index, 1);
		}
	};
}
function removeAllInterceptors() {
	interceptors.length = 0;
}
export { intercept, addInterceptor, removeAllInterceptors };
