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
  data: ResponseDataType<T>;
  status: number;
  statusText: string;
  headers: Headers;
};

export type ResponseDataType<T> =
  | ArrayBuffer
  | String
  | FormData
  | Blob
  | ReadableStream<Uint8Array>
  | T
  | null;

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

const getContentType = (responseHeaders: Headers) => {
  return responseHeaders.get('Content-Type') as string; // content-type이 없는 경우를 고려 X ....
};
const processResponse = async <T = any>(
  fetchResponse: Response,
  responseType: NextFetchDefaultOptions['responseType'],
): Promise<NextFetchResponse<T>> => {
  let type = responseType
    ? responseType
    : getContentType(fetchResponse.headers);

  let data: ResponseDataType<T>;
  switch (type) {
    case 'arraybuffer':
      data = await fetchResponse.arrayBuffer();
      break;

    case 'json':
      data = await fetchResponse.json();
      break;

    case 'text':
      data = await fetchResponse.text();
      break;

    case 'formdata':
      data = await fetchResponse.formData();
      break;

    case 'blob':
      data = await fetchResponse.blob();
      break;

    default:
      data = fetchResponse.body;
      break;
    // stream일 때 이게 맞는지?
  }

  return {
    data,
    status: fetchResponse.status,
    statusText: fetchResponse.statusText,
    headers: fetchResponse.headers,
  };
};

export const nextFetch = {
  create: (defaultOptions?: NextFetchDefaultOptions) => {
    const instance = {
      async get<T>(
        url: string | URL,
        ...args: Parameters<typeof fetch>
      ): Promise<NextFetchResponse<T>> {
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

        let response = await processResponse<T>(
          fetchResponse,
          requestArgs.responseType,
        );

        return response;

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
