export class FetchAxError<T> extends Error {
  constructor(
    readonly statusCode: number,
    readonly response: FetchAXResponse<T>,
  ) {
    super('fetchAx error');
    this.statusCode = statusCode;
    this.response = response;
  }
}

export type RequestInitReturnedByInterceptor = Omit<RequestInit, 'headers'> & {
  headers: Record<string, string>;
};
function getResponseContentType(response: Response): string {
  const contentType = response.headers.get('content-type');
  return contentType ? contentType.split(';')[0] : '';
}

const resolveResponseType = (
  response: Response,
  responseType?: ResponseType,
) => {
  if (responseType) return responseType;
  return getResponseContentType(response) === 'application/json'
    ? 'json'
    : undefined;
};

export const httpErrorHandling = async (
  response: Response,
  requestArgs?: RequestInit,
) => {
  const errorResponse = await processReturnResponse(response);
  let error = new FetchAxError(response.status, errorResponse);

  if (requestArgs?.responseRejectedInterceptor) {
    error = await requestArgs.responseRejectedInterceptor(error);
  }

  return Promise.reject(error);
};

type FetchAXResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'json'
  | 'text'
  | 'stream'
  | 'formdata';

export type FetchAXDefaultOptions = {
  /**
   * Base URL of fetch. It will be used when the first argument of fetch is relative URL.
   *
   * @public
   */
  baseURL?: string;
  /**
   * Defatul Headers of fetch. It will be used when the headers attribute does not exist in the optional object
   *
   * @public
   */
  headers?: HeadersInit;
  /**
   * Throw Error of fetch. If the throwError attribute is true, throw an error when the status is 300 or more
   *
   * @public
   */
  throwError?: boolean;

  /**
   * Response type. It will be used when the type of response data is set
   * json, array buffer, stream, text, blob, formData
   *
   * @public
   */

  responseType?: ResponseType;
  /**
   * Response Interceptor of fetch. It will be called after response
   *
   * @public
   */
  responseInterceptor?: (response: Response) => Response | Promise<Response>;

  /**
   * Response Interceptor of fetch. It will be called after response When the status is 300 or more
   *
   * @public
   */
  responseRejectedInterceptor?: (error: any) => any;

  /**
   * Request Interceptor of fetch. It will be called before request
   *
   * @public
   */
  requestInterceptor?: (
    requestArg: RequestInitReturnedByInterceptor,
  ) => RequestInitReturnedByInterceptor;
};
const parseResponseData = async <T>(
  response: Response,
  type: ResponseType,
): Promise<T> => {
  switch (type) {
    case 'arraybuffer':
      return (await response.arrayBuffer()) as T;
    case 'json':
      return await response.json();
    case 'text':
      return (await response.text()) as T;
    case 'formdata':
      return (await response.formData()) as T;
    case 'blob':
      return (await response.blob()) as T;
    default:
      return response.body as T;
  }
};

const buildFetchAXResponse = <T>(
  response: Response,
  data: T,
): FetchAXResponse<T> => ({
  data,
  status: response.status,
  statusText: response.statusText,
  headers: response.headers,
});

const processReturnResponse = async <T = any>(
  response: Response,
  responseType?: ResponseType,
): Promise<FetchAXResponse<T>> => {
  const resolvedResponseType = resolveResponseType(response, responseType);

  try {
    const data = await parseResponseData<T>(response, resolvedResponseType);
    return buildFetchAXResponse(response, data);
  } catch (error) {
    console.error('Return of original object due to parse error:', error);
    return buildFetchAXResponse<T>(response, response.body as T);
  }
};

/**
 * Arguments of fetch function.
 *
 * @throws {Error} if a first argument of fetch is `Request` object. only string and URL are supported.
 *
 * @public
 */
export type FetchArgs = [string, RequestInit | undefined];

export interface RequestInit extends Omit<globalThis.RequestInit, 'body'> {
  /** fetch-ax does not have a method attribute because it has http request method. */

  /** A BodyInit object or null to set request's body. */
  data?: BodyInit | Record<string, any>;
  /** A string to set request's referrer policy. */
  params?: Record<string, any>;
  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  cache?: RequestCache;
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials;
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers?: HeadersInit;
  /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
  integrity?: string;
  /** A boolean to set request's keepalive. */
  keepalive?: boolean;
  /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
  mode?: RequestMode;
  priority?: RequestPriority;
  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  redirect?: RequestRedirect;
  /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
  referrer?: string;
  /** A referrer policy to set request's referrerPolicy. */
  referrerPolicy?: ReferrerPolicy;
  /** An AbortSignal to set request's signal. */
  signal?: AbortSignal | null;
  /** Can only be null. Used to disassociate request from any Window. */
  window?: null;
  /** Response Interceptor of fetch. It will be called after response */
  responseInterceptor?: (response: Response) => Response | Promise<Response>;
  /** Response Interceptor of fetch. It will be called after response When the status is 300 or more */
  responseRejectedInterceptor?: (error: any) => any;
  /** Request Interceptor of fetch. It will be called before request */
  requestInterceptor?: (
    requestArg: RequestInitReturnedByInterceptor,
  ) => RequestInitReturnedByInterceptor;
  /** Throw Error of fetch. If the throwError attribute is true, throw an error when the status is 300 or more */
  throwError?: boolean;
  /** Resposne data's type */
  responseType?: ResponseType;
}
const isArrayBufferView = (data: any): data is ArrayBufferView => {
  return (
    data &&
    typeof data === 'object' &&
    'buffer' in data &&
    data.buffer instanceof ArrayBuffer &&
    'byteLength' in data &&
    typeof data.byteLength === 'number' &&
    'byteOffset' in data &&
    typeof data.byteOffset === 'number'
  );
};

const isBodyInit = (data: any): data is BodyInit => {
  const isJson = (data: any) => {
    try {
      return typeof JSON.parse(data) === 'object';
    } catch (e) {
      return false;
    }
  };
  return (
    isJson(data) || // data === 'string' 을 통해서도 JSON인지를 확인할 수 있지만 명시적으로 따지기 위해서
    typeof data === 'string' ||
    data instanceof ReadableStream ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof FormData ||
    data instanceof URLSearchParams ||
    isArrayBufferView(data)
  );
};

const combineURLs = (baseURL: string, relativeURL: string) =>
  relativeURL
    ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;

const isAbsoluteURL = (url: string) => {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};

const buildFullPath = (baseURL: string | undefined, requestedURL: string) => {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

const appendParamsToURL = (
  url: string,
  params: Record<string, string> | undefined,
) => {
  if (!params || typeof params !== 'object') {
    return url;
  }
  const [baseUrl, hash] = url.split('#');
  const separator = baseUrl.includes('?') ? '&' : '?';
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

  return `${baseUrl}${separator}${queryString}${hash ? `#${hash}` : ''}`;
};

const applyDefaultOptionsArgs = (
  [url, requestInit]: FetchArgs,
  defaultOptions?: FetchAXDefaultOptions,
): FetchArgs => {
  defaultOptions = mergeOptions(presetOptions, defaultOptions ?? {});

  const requestUrl = appendParamsToURL(
    // `baseURL` will be prepended to `url` unless `url` is absolute.
    buildFullPath(defaultOptions?.baseURL, url),
    requestInit?.params,
  );

  const requestHeaders: Record<string, string> = {};
  if (defaultOptions?.headers) {
    new Headers(defaultOptions.headers).forEach((value, key) => {
      requestHeaders[key] = value;
    });
  }
  if (requestInit?.headers) {
    new Headers(requestInit.headers).forEach((value, key) => {
      requestHeaders[key] = value;
    });
  }

  let requestArgs = {
    ...defaultOptions,
    ...requestInit,
    headers: requestHeaders,
  };

  if (!requestArgs.throwError) {
    requestArgs.throwError = defaultOptions?.throwError
      ? defaultOptions?.throwError
      : false;
  }

  if (defaultOptions?.requestInterceptor) {
    requestArgs = defaultOptions.requestInterceptor(requestArgs);
  }
  if (requestInit?.requestInterceptor) {
    requestArgs = requestInit.requestInterceptor(requestArgs);
  }

  requestArgs.responseInterceptor = chainInterceptor(
    defaultOptions?.responseInterceptor,
    requestInit?.responseInterceptor,
  );
  requestArgs.responseRejectedInterceptor = chainInterceptor(
    defaultOptions?.responseRejectedInterceptor,
    requestInit?.responseRejectedInterceptor,
  );

  return [requestUrl.toString(), requestArgs];
};

function isHttpError(response: Response) {
  return response.status >= 300;
}

function ensureBodyInit(data: BodyInit | Record<string, any>): BodyInit {
  if (isBodyInit(data)) {
    return data;
  }
  return serializeBody(data);
}

function serializeBody(data: Record<string, any>): BodyInit {
  return JSON.stringify(data);
}

const fetchAX = {
  create: (defaultOptions?: FetchAXDefaultOptions) => {
    const instance = {
      async get<T = any>(
        url: string,
        args?: RequestInit,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'GET',
        });

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }

        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
      async post<T = any>(
        url: string,
        data?: BodyInit | Record<string, any>,
        args?: Omit<RequestInit, 'data'>,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, { ...args, data }],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'POST',
          body: requestArgs?.data ? ensureBodyInit(requestArgs.data) : null,
        });

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }
        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
      async put<T = any>(
        url: string,
        data?: BodyInit | Record<string, any>,
        args?: Omit<RequestInit, 'data'>,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, { ...args, data }],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'PUT',
          body: requestArgs?.data ? ensureBodyInit(requestArgs.data) : null,
        });

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }

        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
      async delete<T = any>(
        url: string,
        args?: RequestInit,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'DELETE',
        });

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }

        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
      async patch<T = any>(
        url: string,
        data?: BodyInit | Record<string, any>,
        args?: Omit<RequestInit, 'data'>,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, { ...args, data }],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'PATCH',
          body: requestArgs?.data ? ensureBodyInit(requestArgs.data) : null,
        });

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }

        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
      async head<T = any>(
        url: string,
        args?: RequestInit,
      ): Promise<FetchAXResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = (await fetch(requestUrl, {
          ...requestArgs,
          method: 'HEAD',
        })) as unknown as Response;

        if (requestArgs?.throwError && isHttpError(response))
          return await httpErrorHandling(response, requestArgs);

        if (requestArgs?.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        }
        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs?.responseType,
        );

        return returnResponse;
      },
    };
    return instance;
  },
  async get<T = any>(
    url: string,
    args?: RequestInit,
  ): Promise<FetchAXResponse<T>> {
    return this.create().get(url, args);
  },
  async post<T = any>(
    url: string,
    data?: BodyInit | Record<string, any>,
    args?: Omit<RequestInit, 'data'>,
  ): Promise<FetchAXResponse<T>> {
    return this.create().post(url, data, args);
  },
  async put<T = any>(
    url: string,
    data?: BodyInit | Record<string, any>,
    args?: Omit<RequestInit, 'data'>,
  ): Promise<FetchAXResponse<T>> {
    return this.create().put(url, data, args);
  },
  async patch<T = any>(
    url: string,
    data?: BodyInit | Record<string, any>,
    args?: Omit<RequestInit, 'data'>,
  ): Promise<FetchAXResponse<T>> {
    return this.create().patch(url, data, args);
  },
  async delete<T = any>(
    url: string,
    args?: RequestInit,
  ): Promise<FetchAXResponse<T>> {
    return this.create().delete(url, args);
  },
  async head<T = any>(
    url: string,
    args?: RequestInit,
  ): Promise<FetchAXResponse<T>> {
    return this.create().head(url, args);
  },
};
export default fetchAX;
export const presetOptions: FetchAXDefaultOptions = {
  headers: { 'Content-Type': 'application/json' },

  throwError: true,

  // baseURL: ''
};
export function mergeOptions(
  ...args: Record<string, any>[]
): FetchAXDefaultOptions {
  const result: Record<string, any> = { ...args[0] };

  for (let i = 1; i < args.length; i++) {
    const props = args[i];

    for (const key in props) {
      const a = result[key];
      const b = props[key];

      if (typeof a === 'function' && typeof b === 'function') {
        result[key] = chainInterceptor(a, b);
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }
  return result;
}

export function chainInterceptor<T>(
  ...interceptors: (((arg: T) => Promise<T> | T) | undefined)[]
): ((arg: T) => Promise<T>) | undefined {
  if (interceptors.filter((interceptor) => interceptor).length === 0) return;
  return async (arg: T) => {
    let result = arg;
    for (let interceptor of interceptors) {
      if (interceptor && typeof interceptor === 'function') {
        result = await interceptor(result);
      }
    }
    return result;
  };
}
