<p align="center">
  <img src="https://github.com/user-attachments/assets/8198f16a-a13e-4c3a-9691-fe5eb471ea22" width="100" alt="Mock Service Worker logo" />
</p>

<h1 align="center">fetch-ax</h1>
<p align="center">A modern HTTP client that extends the Fetch API, providing Axios-like syntax and full compatibility with Next.js App Router.</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/fetch-ax.svg?style=for-the-badge&label=Latest&color=blue" alt="Package version" />
 <img src="https://img.shields.io/npm/l/fetch-ax.svg?style=for-the-badge" alt="Discord server" />
</p>

<br />

<br />

## Features

- **"Don't learn, only use"**
- Zero learning curve, Zero configuration, Zero dependencies
- Fully compatible with Next.js App Router
- Simple yet powerful

<br />

## Why fetch-ax?

We are usually familiar with using API libraries (e.g., axios), but sometimes we need to use the [native web Fetch API.](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API) This situation has become more frequent with the introduction of Next.js v13 App Router. Next.js has extended the basic Fetch API to add important features like server-side caching. As a result, Fetch has become a necessity rather than an option.

Fetch is a powerful API, but it lacks key features for enhancing developer experience (DX), **such as interceptors, instance, error handling, and response parsing**. The absence of these can significantly reduce productivity and complicate code. While some libraries have extended fetch to address these issues, they often introduce unique syntax, creating a new learning curve.

**We no longer need to learn how to use additional API libraries.** Instead, we can develop efficiently using the familiar Axios syntax. fetch-ax extends Fetch with syntax similar to Axios, providing all the utility functions essential for modern application development, such as interceptors, error handling, and response parsing.

<br />

## Examples

Performing a GET request

```js
import fetchAX from 'fetch-ax';

fetchAX
  .get('https://example.com/user?ID=12345')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });

fetchAX
  .get('https://example.com/user', {
    params: {
      ID: 12345,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // always executed
  });

// async/await
async function getUser() {
  try {
    const response = await fetchAX.get('https://example.com/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

Performing a POST request

```js
fetchAX
  .post('https://example.com/user', {
    firstName: 'Fred',
    lastName: 'Flintstone',
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

### fetch-ax API

##### fetchAX,create([options])

##### fetchAX.get(url[, args])

##### fetchAX.post(url[, data[, args])

##### fetchAX.put(url[, data[, args])

##### fetchAX.patch(url[, data[, args])

##### fetchAX.delete(url[, args])

##### fetchAX.head(url[, args])

<br/>

## 🚀Quick Start

Install:

```
# npm
npm i fetch-ax

# yarn
yarn add fetch-ax

#pnpm
pnpm i fetch-ax
```

## ✔️ Instance

You can create a new instance of fetchAX with a default options.

```tsx
const instance = fetchAX.create({
  baseURL: 'https://example.com',
  headers: {
    Authorization: `Bearer ${YOUR_ACCESS_TOKEN}`,
  },
});

instance.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone',
});
```

### Instance methods

The available instance methods are listed below.

##### fetchAX#get(url[, args])

##### fetchAX#post(url[, data[, args])

##### fetchAX#put(url[, data[, args])

##### fetchAX#patch(url[, data[, args])

##### fetchAX#delete(url[, args])

##### fetchAX#head(url[, args])

## ✔️ Parsing Response

If you set a response type, you can parse the response with that type. The default type is 'json'.

```tsx
const instance = fetchAX.create();

// This does not parse the response
const response = instance.get('/');

// response data type is json
const responseWithJson = instance.get('/', {
  responseType: 'json',
});

// response data type is form data
const responseWithFormData = instance.get('/', {
  responseType: 'formdata',
});
```

## ✔️ Error handling

If throwError is set to true, throw an error when the status falls out of the 2XX range. The default value is true.

```tsx
import fetchAX from '../src';

const instance = fetchAX.create({ throwError: true });

// error handling will not apply
const errorHandlingFalseResponse = instance.get('/', { throwError: false });

// error handling will apply
try {
  const errorHandlingTrueResponse = instance.get('/');
} catch (error) {}
```

## ✔️ Interceptor

You can intercept requests or responses

```tsx
import fetchAX, { RequestInit } from '../src';

const instance = fetchAX.create({
  responseInterceptor: (response: any) => {
    console.log('default options response interceptor');
    return response;
  },
  requestInterceptor: (requestArg: RequestInit) => {
    console.log('default options reqeust interceptor');
    return requestArg;
  },
});

// The console is printed in the following order
/*
default options reqeust interceptor
requestInit reqeust interceptor
default options response interceptor
requestInit response interceptor
 */
const response = instance.get('/', {
  requestInterceptor: (requestArg: RequestInit) => {
    console.log('requestInit reqeust interceptor');
    return requestArg;
  },
  responseInterceptor: (response: any) => {
    console.log('requestInit response interceptor');
    return response;
  },
});

console.log(response);
```

You can also intercept responses when rejected to handle errors. This allows you to implement custom error handling logic for failed requests.

```
const instance = fetchAX.create({
  throwError: true,
  responseRejectedInterceptor: (error: FetchAxError) => {
    if (error.statusCode === 400) {
      return Promise.reject(
        new BadRequestError({
          message: 'Bad Request',
          response: error.response,
        }),
      );
    }
  },
});

```

### default options

| Property                    | Description                              | Type                                                  | Default                                             |
| --------------------------- | ---------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| baseURL                     | base url                                 | string \| URL                                         | -                                                   |
| headers                     | fetch headers                            | HeadersInit                                           | new Headers([['Content-Type', 'application/json']]) |
| throwError                  | whether to throw an error                | boolean                                               | true                                                |
| responseType                | response type to parse                   | ResponseType                                          | json                                                |
| responseInterceptor         | interceptor to be executed on response   | (response: Response) => Response \| Promise<Response> | -                                                   |
| responseRejectedInterceptor | interceptor to handle rejected responses | (error: any) => any                                   | -                                                   |
| requestInterceptor          | interceptor to be executed on request    | (requestArg: RequestInit) => RequestInit              | -                                                   |
