import { nextFetch } from '../src';

const instance = nextFetch.create({
  responseInterceptor: (response: Response) => {
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
  responseInterceptor: (response: Response) => {
    console.log('requestInit response interceptor');
    return response;
  },
});
