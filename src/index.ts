type Nextresponse<T = any> = {
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
  responseType?: ResponseType;
  responseInterceptor?: (response: Response) => Promise<Response>;
  /**
   * Request Interceptor of fetch. It will be called before request
   *
   * @public
   */
  requestInterceptor?: (requestArg: RequestInit) => Promise<RequestInit>;
};

// return response로 가공하는 함수
const processReturnResponse = async <T = any>(
  response: Response,
  responseType: ResponseType,
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
    // stream일 때 이게 맞는지?
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
  data?: BodyInit | Record<string, any>;
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
  responseInterceptor?: (response: Response) => Promise<Response>;
  /** Request Interceptor of fetch. It will be called before request */
  requestInterceptor?: (requestArg: RequestInit) => Promise<RequestInit>;
  /** Throw Error of fetch. If the throwError attribute is true, throw an error when the status is 300 or more */
  throwError?: boolean;
  /** data's type */
  responseType?: ResponseType;
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
      async get<T = any>(url: string | URL, args?: RequestInit): Promise<Nextresponse<T>> {
        // default options를 가지고 options 만들기
         let requestArgs = applyDefaultOptionsArgs(
          [url, args],
          defaultOptions,
        );
        // 요청에는 먼저 content type을 확인한다
        //
        let response = await fetch(url, {
          method: 'get',
        }); // 수정 필요 현재는 response interceptor을 위한 임의 값

        httpErrorHandling(response);
        if (requestArgs.responseInterceptor) {
          response = await requestArgs.responseInterceptor(response);
        } // interceptor 실행

        const returnResponse = await processReturnResponse<T>(
          response,
          requestArgs.responseType,
        );

        return returnResponse;
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
