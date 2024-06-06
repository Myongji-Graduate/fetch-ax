// // Prepare the response
// const responseHeaders = AxiosHeaders.from(
//   'getAllResponseHeaders' in request && request.getAllResponseHeaders()
// );
// const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
//   request.responseText : request.response;
// const response = {
//   data: responseData,
//   status: request.status,
//   statusText: request.statusText,
//   headers: responseHeaders,
//   config, // AxiosRequestConfig에 header만 추가된 타입
//   request // axios 공식 문서를 보면 응답을 생성한 요청이라는데 어디에 사용되는지 모르겠음
// };

export type NextFetchResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

interface NextFetchRequestInit<T = any> extends RequestInit {
  data?: T;
  throwError?: boolean;
  responseJson?: boolean;
  requestJson?: boolean;
}
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
  requestJson?: boolean;
  /**
   * Response Interceptor of fetch. It will be called after response
   *
   * @public
   */
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';
  responseInterceptor?: (response: Response) => Promise<Response>;
  /**
   * Request Interceptor of fetch. It will be called before request
   *
   * @public
   */
  requestInterceptor?: (requestArg: RequestInit) => Promise<RequestInit>;
};

// createResponse가 할 일
const getContentType = (responseHeaders: Headers) => {
  const header = new Headers(responseHeaders);
  return header.get('Content-Type') as string; // content-type이 없는 경우를 고려 X
};
const processResponse = async (
  fetchResponse: Response,
  responseType: NextFetchDefaultOptions['responseType'],
) => {
  let type = responseType
    ? responseType
    : getContentType(fetchResponse.headers);

  let data: ArrayBuffer | JSON;

  // response type을 먼저 확인한다
  // response type이 없으면 content-type을 확인한다
  // type을 가지고 data를 가공한 후 반환
};

export const nextFetch = {
  create: (defaultOptions?: NextFetchDefaultOptions) => {
    const instance = {
      async get<T = any>(
        url: string | URL,
        ...args: Parameters<typeof fetch>
      ): Promise<any> {
        // default options를 가지고 options 만들기
        let requestArgs: any;
        if (defaultOptions?.requestInterceptor) {
          requestArgs = await defaultOptions?.requestInterceptor(requestArgs);
        }

        // 요청에는 먼저 content type을 확인한다
        //
        const fetchResponse = await fetch(url, {
          method: 'get',
          body: requestArgs.data,
        }); // 수정 필요 현재는 response interceptor을 위한 임의 값

        let response = await processResponse(
          fetchResponse,
          requestArgs.responseType,
        );

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
