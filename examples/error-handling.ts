import { nextFetch } from '../src';

const instance = nextFetch.create({ throwError: true });

// error handling will not apply
const errorHandlingFalseResponse = instance.get('/', { throwError: false });

// error handling will apply
try {
  const errorHandlingTrueResponse = instance.get('/');
} catch (error) {}
