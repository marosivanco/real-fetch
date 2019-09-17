export default (fetch, url, { signal, timeout, ...options } = {}) => {
	const controller = new AbortController();
	const promise = fetch(url, { signal: controller.signal, timeout, ...options });
	if (signal) {
		signal.addEventListener("abort", () => controller.abort());
	}
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	return promise.finally(() => clearTimeout(timeoutId));
};
