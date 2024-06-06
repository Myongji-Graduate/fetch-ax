type NextFetchResponse<T extends ResponseType, D = any> = {
  data: ResponseData<T, D>;
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

type ResponseData<T extends ResponseType, D = any> = T extends 'arraybuffer'
  ? ArrayBuffer
  : T extends 'blob'
    ? Blob
    : T extends 'json'
      ? D
      : T extends 'text'
        ? string
        : T extends 'formdata'
          ? FormData
          : ReadableStream<Uint8Array> | null;

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

const processResponse = async <T extends ResponseType, D = any>(
  fetchResponse: Response,
  responseType: ResponseType,
): Promise<NextFetchResponse<T, D>> => {
  let data: ResponseData<T, D>;
  switch (responseType) {
    case 'arraybuffer':
      data = (await fetchResponse.arrayBuffer()) as ResponseData<T, D>;
      break;

    case 'json':
      data = (await fetchResponse.json()) as ResponseData<T, D>;
      break;

    case 'text':
      data = (await fetchResponse.text()) as ResponseData<T, D>;
      break;

    case 'formdata':
      data = (await fetchResponse.formData()) as ResponseData<T, D>;
      break;

    case 'blob':
      data = (await fetchResponse.blob()) as ResponseData<T, D>;
      break;

    default:
      data = fetchResponse.body as ResponseData<T, D>;
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
      async get<T extends ResponseType>(
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
        let fetchResponse = await fetch(url, {
          method: 'get',
          body: requestArgs.data,
        }); // 수정 필요 현재는 response interceptor을 위한 임의 값

        if (requestArgs.responseInterceptor) {
          fetchResponse = await requestArgs.responseInterceptor(fetchResponse);
        } // interceptor 실행

        const response = await processResponse<T>(
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
