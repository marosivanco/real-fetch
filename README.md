# Real Fetch

Decorates (native) fetch with support for interceptors and timeouts.

# Installation

```
npm install real-fetch --save
```

# Usage

```javascript
import { create, addInterceptor, removeAllInterceptors } from "real-fetch";
// create decorated fetch
// see the note for other than browser environments and glob replacement
const fetch = create(window.fetch);

// register interceptor
const remove = addInterceptor({
	request(url, config) {
		console.log("request", url, config);
		return [url, config];
	},
	requestError(error, url, config) {
		console.log("requestError", error, url, config);
		// return [url, config] to recover from error or throw something
		return [url, config];
	},
	response(response, url, config) {},
	responseError(error, url, config) {
		// return value to recover, or throw something
		return false;
	},
});

// Fetch with custom timeout
fetch("http://www.example.org", { timeout: 5000 })
	.then(response => {
		console.log(response.text());
	})
	.catch(error => {
		if (error instanceof AbortError) {
			console.log("Timeout!");
		}
	});

// remove previously added interceptor
remove();

// remove all
removeAllInterceptors();
```

**Note**
If you need to intercept or timeout native [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) in other components, you can define function which replaces native global:

```javascript
import { create } from "real-fetch";
export default function attach(env) {
	env.fetch = create(env.fetch);
}
```

and then call it before:

```javascript
import attach from "./attach";
attach(window);
```

# Description

You'll quickly notice if you try using native fetch, that some parts required for real use are missing:

- interceptors (to make error handling global)
- custom connection timeout (to fail fast instead of waiting forever)
- upload and download progress observation

The library decorates (native) fetch with support for interceptors and timeouts.

Upload progress observation issue is not solvable at the moment.

# API

## create

Creates decorated [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) with support for interceptors and timeouts.

**Syntax**

```javascript
create(native_fetch);
```

**Parameters**

- `native_fetch` - Native [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).

**Returns**

Decorated [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) with interceptors and timeouts.

Returned function signature:

```javascript
fetch(url, config);
```

Parameters:

- `url` - URL the user should be redirected to after successful authentication.
- `config` - Same as in [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) + additional property:
  - `timeout` - custom connection timeout in ms. Defaults to browser timeout.

Returns:

Promise as in [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
**Example**

```javascript
const fetch = create(window.fetch);
fetch("http://www.example.org", { timeout: 5000 })
	.then(response => {
		console.log(response.text());
	})
	.catch(error => {
		if (error instanceof AbortError) {
			console.log("Timeout!");
		}
	});
```

## addInterceptor

Adds interceptor to the end of (promise) chain. The interceptors are invoked in order of addition.

**Syntax**

```javascript
addInterceptor(interceptor);
```

**Parameters**

- `interceptor` - Object with following callback methods:
  - `request(url, config)` - enable url/config preprocessing. Returns `[url, config]`
  - `requestError(error, url, config)` - called when processing of `request()` callback result in error.
  - `response(response, url, config)` - called after resolved [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch). Should either return `response`, or throw an error.
  - `responseError(error, url, config)`- called after rejected [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) (or previous interceptor). Should either return [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) to recover, or (re)throw an error.

**Returns**

Function used to remove the interceptor.

**Example**

```javascript
// register interceptor
const remove = addInterceptor({
	request(url, config) {
		console.log("request", url, config);
		return [url, config];
	},
	requestError(error, url, config) {
		console.log("requestError", error, url, config);
		// return [url, config] to recover from error or throw something
		return [url, config];
	},
	response(response, url, config) {},
	responseError(error, url, config) {
		// return value to recover, or throw something
		return false;
	},
});

// Fetch with custom timeout
fetch("http://www.example.org");

// remove previously added interceptor
remove();
```

## removeAllInterceptors

Removes all previously added interceptors.

**Syntax**

```javascript
removeAllInterceptors();
```

**Example**

```javascript
addInterceptor({
	response(response, url, config) {
		//...
	},
});

removeAllInterceptors();
```

# Acknowledgement

Based on the ideas from:

- [fetch-intercept](https://github.com/werk85/fetch-intercept)
- StackOverflow [answer](https://stackoverflow.com/a/57888548/9452541).

# License

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)
