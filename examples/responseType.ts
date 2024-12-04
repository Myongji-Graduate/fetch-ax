import fetchAX from '../src';

const instance = fetchAX.create();

// Automatically parses the response body as JSON if the 'Content-Type' header is 'application/json'.
// Otherwise, returns the raw response body.
const response = instance.get('/');

// response data type is json
const responseWithJson = instance.get('/', {
  responseType: 'json',
});

// response data type is form data
const responseWithFormData = instance.get('/', {
  responseType: 'formdata',
});
