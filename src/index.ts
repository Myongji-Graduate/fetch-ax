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
   * Request Json of fetch. If the requestJson attribute is true, request data type is json
   *
   * @public
   */
  requestJson?: boolean;
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
        args: Parameters<typeof fetch>,
      ): Promise<Response | any> {
        // 개발 진행 중이므로 any타입을 임의로 추가

        // default options를 적용한 args 생성
        const requestArgs = applyDefaultOptionsArgs(
          [url, args[1]],
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
