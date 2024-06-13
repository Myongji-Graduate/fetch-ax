import { httpErrorHandling } from './error';

type NextResponse<T = any> = {
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

export type NextFetchDefaultOptions = {
  /**
   * Base URL of fetch. It will be used when the first argument of fetch is relative URL.
   *
   * @public
   */
  baseURL?: string | URL;
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
   * Request Interceptor of fetch. It will be called before request
   *
   * @public
   */
  responseInterceptor?: (response: Response) => Response | Promise<Response>;

  /**
   * Response Interceptor of fetch. It will be called after response
   *
   * @public
   */
  requestInterceptor?: (requestArg: RequestInit) => RequestInit;
};

const processReturnResponse = async <T = any>(
  response: Response,
  responseType?: ResponseType,
) => {
  let data: T;
  switch (responseType) {
    case 'arraybuffer':
      data = (await response.arrayBuffer()) as T;
      break;

    case 'json':
      data = await response.json();
      break;

    case 'text':
      data = (await response.text()) as T;
      break;

    case 'formdata':
      data = (await response.formData()) as T;
      break;

    case 'blob':
      data = (await response.blob()) as T;
      break;

    default:
      data = response.body as T;
      break;
  }
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
};

/**
 * Arguments of fetch function.
 *
 * @throws {Error} if a first argument of fetch is `Request` object. only string and URL are supported.
 *
 * @public
 */
export type FetchArgs = [string | URL, RequestInit | undefined];

interface RequestInit {
  /** next fetch does not have a method attribute because it has http request method. */

  /** A BodyInit object or null to set request's body. */
  data?: BodyInit;
  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  cache?: RequestCache;
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials;
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers: Headers;
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
  /** Request Interceptor of fetch. It will be called before request */
  requestInterceptor?: (requestArg: RequestInit) => RequestInit;
  /** Throw Error of fetch. If the throwError attribute is true, throw an error when the status is 300 or more */
  throwError?: boolean;
  /** data's type */
  responseType?: ResponseType;
}

const applyDefaultOptionsArgs = (
  [url, requestInit]: FetchArgs,
  defaultOptions?: NextFetchDefaultOptions,
): FetchArgs => {
  const requestUrl: FetchArgs[0] = defaultOptions?.baseURL
    ? new URL(url, defaultOptions.baseURL)
    : url;

  const requestHeaders = new Headers([['Content-Type', 'application/json']]);
  if (defaultOptions?.headers) {
    new Headers(defaultOptions.headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }
  if (requestInit?.headers) {
    new Headers(requestInit.headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }

  let requestArgs = {
    ...defaultOptions,
    ...requestInit,
    headers: requestHeaders,
  };

  if (defaultOptions?.requestInterceptor) {
    requestArgs = defaultOptions.requestInterceptor(requestArgs);
  }
  if (requestInit?.requestInterceptor) {
    requestArgs = requestInit.requestInterceptor(requestArgs);
  }

  return [requestUrl, requestArgs];
};

export const nextFetch = {
  create: (defaultOptions?: NextFetchDefaultOptions) => {
    const instance = {
      async get<T = any>(
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'GET',
        });

        httpErrorHandling(response);
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
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'POST',
          body: requestArgs?.data ? requestArgs.data : null,
        });

        httpErrorHandling(response);
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
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'PUT',
          body: requestArgs?.data ? requestArgs.data : null,
        });

        httpErrorHandling(response);
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
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'DELETE',
        });

        httpErrorHandling(response);
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
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'PATCH',
          body: requestArgs?.data ? requestArgs.data : null,
        });

        httpErrorHandling(response);
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
        url: string | URL,
        args?: RequestInit,
      ): Promise<NextResponse<T>> {
        const [requestUrl, requestArgs] = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        let response = await fetch(requestUrl, {
          ...requestArgs,
          method: 'HEAD',
        });

        httpErrorHandling(response);
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
};
