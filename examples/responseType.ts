import fetchAX from "../src";

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
