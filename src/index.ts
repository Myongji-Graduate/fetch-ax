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
  requestJson?: boolean;
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

export const nextFetch = {
  create: (defaultOptions?: NextFetchDefaultOptions) => {
    const instance = {
      async get<T = any>(url: string | URL): Promise<Nextresponse<T>> {
        // default options를 가지고 options 만들기
        let requestArgs: any;

        // 요청에는 먼저 content type을 확인한다
        //
        let response = await fetch(url, {
          method: 'get',
        }); // 수정 필요 현재는 response interceptor을 위한 임의 값

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
