import { FetchAXDefaultOptions } from './index.js';

export const presetOptions: FetchAXDefaultOptions = {
  headers: new Headers([['Content-Type', 'application/json']]),

  throwError: true,

  responseType: 'json',
};
