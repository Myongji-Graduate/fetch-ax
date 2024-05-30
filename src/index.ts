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

export const nextFetch = {
  create: (defaultOptions: NextFetchDefaultOptions) => {
    const instance = {
      get(): any {
        // default options를 가지고 options 만들기
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
