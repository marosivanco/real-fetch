import { intercept } from "./intercept";

export function create(fetch) {
	return (...args) => intercept(fetch, ...args);
}
