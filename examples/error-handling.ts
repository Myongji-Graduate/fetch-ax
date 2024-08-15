import fetchAX from "../src";

const instance = fetchAX.create({ throwError: true });

// error handling will not apply
const errorHandlingFalseResponse = instance.get('/', { throwError: false });

// error handling will apply
try {
  const errorHandlingTrueResponse = instance.get('/');
} catch (error) {}
