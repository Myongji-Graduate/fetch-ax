import { nextFetch } from '../src';

// Content-Type default value is application-json
// But Content-Type value changed due to default options
const instance = nextFetch.create({
  headers: {
    'Content-Type': 'text/plain',
  },
});

const response = instance.get('/');

// Content-Type value changed due to request init
const responseWithChangedHeaders = instance.get('/', {
  headers: {
    'Content-Type': 'multipart/formed-data',
  },
});
