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