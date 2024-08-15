# fetch-ax

---

A better fetch API , An easier fetch API. 

# 🚀Quick Start

Install:

```
# npm
npm i fetch-ax

# yarn
yarn add fetch-ax

#pnpm
pnpm i fetch-ax
```

# ✔️ Instance

You can create a new instance of fetchAX with a default options.

```tsx
const instance = fetchAX.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'text/plain',
  },
});

instance.post("/",{
  data:{} // the body you want to add to the request.
})
```

### Instance methods

The available instance methods are listed below. 

### get(url,args)

### post(url,args)

### put(url,args)

### delete(url,args)

### patch(url,args)

### head(url,args)

# ✔️ Parsing Response

If you set a response type, you can parse the response with that type.

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

# ✔️ Error handling

If throwError is set to true, throw an error when the status falls out of the 2XX range  

```tsx
import fetchAX from "../src";

const instance = fetchAX.create({ throwError: true });

// error handling will not apply
const errorHandlingFalseResponse = instance.get('/', { throwError: false });

// error handling will apply
try {
  const errorHandlingTrueResponse = instance.get('/');
} catch (error) {}

```

# ✔️ Interceptor

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

console.log(response)
```

### default options

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| baseURL | base url  | `string \| URL`  | - |
| headers | fetch headers | `HeadersInit`  | - |
| throwError | whether to throw an error | `boolean`  | false |
| responseType | response type to parse | `ResponseType`  | - |
| responseInterceptor | interceptor to be executed on response |  `(response: Response) => Response \| (response: Response) => Promise<Response>`  | - |
| requestInterceptor | interceptor to be executed on request | `(requestArg: RequestInit) => RequestInit`  | - |
