import { nextFetch } from '../src';

// response type default value is json
const instance = nextFetch.create();

// response data will apply json parse
const response = instance.get('/');

// response data type is form data
const responseWithChangedResponseType = instance.get('/', {
  responseType: 'formdata',
});
