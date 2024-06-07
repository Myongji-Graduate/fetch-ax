export type NextFetchDefaultOptions = {
  /**
   * Base URL of fetch. It will be used when the first argument of fetch is relative URL.
   *
   * @public
   */
  baseUrl?: string | URL;
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
   * Response Json of fetch. If the responseJson attribute is true, response data type is json
   *
   * @public
   */
  responseJson?: boolean;
  /**
   * Response Interceptor of fetch. It will be called after response
   *
   * @public
   */
  responseInterceptor?: (requestArg: RequestInit) => Promise<RequestInit>;
  /**
   * Request Interceptor of fetch. It will be called before request
   *
   * @public
   */
  requestInterceptor?: (responseArg: ResponseInit) => Promise<ResponseInit>;
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
  data?: BodyInit | null;
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
}

const applyDefaultOptionsArgs = (
  [url, requestInit]: FetchArgs,
  defaultOptions?: NextFetchDefaultOptions,
): FetchArgs => {
  const requestUrl: FetchArgs[0] = defaultOptions?.baseUrl
    ? new URL(url, defaultOptions.baseUrl)
    : url;

  const requestHeaders = new Headers({
    ...defaultOptions?.headers,
    ...requestInit?.headers,
  });

  return [
    requestUrl,
    {
      ...requestInit,
      headers: requestHeaders,
    },
  ];
};

export const nextFetch = {
  create: (defaultOptions?: NextFetchDefaultOptions) => {
    const instance = {
      async get(
        url: string | URL,
        args?: RequestInit,
      ): Promise<Response | any> {
        // 개발 진행 중이므로 any타입을 임의로 추가

        // default options를 적용한 args 생성
        const requestArgs = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );

        // request interceptor 실행
        // 요청
        // response interceptor 실행
        // 요청 값 반환
      },
      post(): any {},
      put(): any {},
      delete(): any {},
      patch(): any {},
      head(): any {},
    };
    return instance;
  },
};
