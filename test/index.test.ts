import { default as fetchAX, FetchAxError, RequestInit } from '../src';

describe('next-fetch', () => {
  const globalFetch = global.fetch;
  let fetchMocked: jest.Mock;
  let mockRequestInterceptor: jest.Mock;
  let mockResponseInterceptor: jest.Mock;

  const mockResponseData = {
    userId: 1,
    id: 1,
    title: 'delectus aut autem',
    completed: false,
  };

  beforeEach(() => {
    fetchMocked = jest.fn().mockResolvedValue({
      body: JSON.stringify(mockResponseData),
      headers: {
        get: (header: string) => {
          if (header === 'Content-Type') {
            return 'application/json';
          }
        },
      },
      json: jest.fn().mockResolvedValue(mockResponseData),
    });

    // @ts-ignore
    global.fetch = fetchMocked;
    mockRequestInterceptor = jest
      .fn()
      .mockImplementation((requestArg: RequestInit) => {
        return requestArg;
      });

    mockResponseInterceptor = jest
      .fn()
      .mockImplementation(
        (response: Response): Response | Promise<Response> => {
          return response;
        },
      );
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
  });

  it('should call next fetch default option when default option is not specified.', async () => {
    // given
    const instance = fetchAX.create();

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      //default
      {
        headers: new Headers([['Content-Type', 'application/json']]),
        method: 'GET',
        throwError: true,
      },
    );
  });

  it('should apply default headers.', async () => {
    // given
    const instance = fetchAX.create({
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers({
          'content-Type': 'application/json',
          accept: 'application/json',
        }),
        method: 'GET',
        throwError: true,
      },
    );
  });

  it('should override default headers', async () => {
    // given
    const instance = fetchAX.create({
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers([['Content-Type', 'application/json']]),
        method: 'GET',
        throwError: true,
      },
    );
  });

  it('should call request, response interceptors', async () => {
    // given
    const instance = fetchAX.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      requestInterceptor: mockRequestInterceptor,
      responseInterceptor: mockResponseInterceptor,
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(mockRequestInterceptor).toHaveBeenCalled();
    expect(mockResponseInterceptor).toHaveBeenCalled();
  });

  it('should response type json', async () => {
    // given
    const instance = fetchAX.create({
      responseType: 'json',
    });

    //when
    const data = await instance.get(
      'https://jsonplaceholder.typicode.com/todos/1',
    );
    //then
    expect(typeof data).toEqual(typeof JSON);
  });

  it('should returns the raw response body due to parsing error', async () => {
    // given
    const instance = fetchAX.create({ responseType: 'formdata' });
    let error;
    let response;
    //when
    try {
      response = await instance.get(
        'https://jsonplaceholder.typicode.com/todos/1',
      );
    } catch (e) {
      error = e;
    }
    //then
    expect(error).toEqual(undefined);
    expect(typeof response?.data).toEqual('string');
  });

  it('should call request with params', async () => {
    // given
    const instance = fetchAX.create();

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      params: {
        id: 1,
      },
    });

    // then
    expect(fetchMocked).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1?id=1',
      {
        headers: new Headers([['content-type', 'application/json']]),
        method: 'GET',
        throwError: true,
        params: {
          id: 1,
        },
      },
    );
  });
});

describe('next-fetch-error', () => {
  const globalFetch = global.fetch;
  let fetchMocked: jest.Mock;

  beforeEach(() => {
    fetchMocked = jest.fn().mockResolvedValue({
      status: 300,
      json: jest.fn().mockResolvedValue({
        error: 'Multiple choices available',
      }),
      headers: {
        get: (header: string) => {
          if (header === 'Content-Type') {
            return 'application/json';
          }
          return null;
        },
      },
    });

    // @ts-ignore
    global.fetch = fetchMocked;
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = globalFetch;
  });

  it('should throw error above status 300.', async () => {
    // given
    const instance = fetchAX.create({
      throwError: true,
    });
    let error;

    // when
    try {
      await instance.get('https://jsonplaceholder.typicode.com/Error/1');
    } catch (e) {
      error = e;
    }

    // then
    expect(error).toBeInstanceOf(FetchAxError);
  });
});

describe('interceptor', () => {
  describe('response-interceptor', () => {
    let fetchMocked: jest.Mock;
    const globalFetch = global.fetch;

    beforeEach(() => {
      fetchMocked = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          userId: 1,
          id: 1,
          title: 'delectus aut autem',
          completed: false,
        }),
      });

      global.fetch = fetchMocked;
    });
    afterEach(() => {
      // @ts-ignore
      global.fetch = globalFetch;
    });

    it('should return response', async () => {
      // given
      const instance = fetchAX.create({
        responseType: 'json',
        responseInterceptor: (response) => {
          return response;
        },
      });

      // when
      const response = await instance.get(
        'https://jsonplaceholder.typicode.com/todos/1',
      );

      // then
      expect(response.data).toEqual({
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false,
      });
    });
  });

  describe('response-rejected-interceptor', () => {
    const globalFetch = global.fetch;
    let fetchMocked: jest.Mock;

    beforeEach(() => {
      fetchMocked = jest.fn().mockResolvedValue({
        status: 300,
        headers: {
          get: (header: string) => {
            if (header === 'Content-Type') {
              return 'application/json';
            }
            return null;
          },
        },
        json: jest.fn().mockResolvedValue({
          error: 'Multiple choices available',
        }),
      });

      // @ts-ignore
      global.fetch = fetchMocked;
    });

    afterEach(() => {
      // @ts-ignore
      global.fetch = globalFetch;
    });

    it('return promise reject error', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            return Promise.reject({ error: 'error' });
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        // then
        expect(error).toEqual({
          error: 'error',
        });
      }
    });

    it('throw reject error', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            throw { error: 'error' };
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        // theb
        expect(error).toEqual({
          error: 'error',
        });
      }
    });

    it('return object', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,

        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            return { error: 'error' };
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        // then
        expect(error).toEqual({
          error: 'error',
        });
      }
    });

    it('chain interceptor', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            return { error: 'chain' };
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1', {
          responseRejectedInterceptor: (error) => {
            if (error.error === 'chain') {
              return { error: 'chain-error' };
            }
          },
        });
      } catch (error) {
        // then
        expect(error).toEqual({
          error: 'chain-error',
        });
      }
    });

    it('return promise custom error', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            return Promise.reject(
              new BadRequestError({
                message: 'Bad Request',
                response: error.response,
              }),
            );
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        // then
        expect(error).toBeInstanceOf(BadRequestError);
        if (error instanceof BadRequestError) {
          expect(error.message).toBe('Bad Request');
        }
      }
    });

    it('throw promise custom error', async () => {
      // given
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            throw new BadRequestError({
              message: 'Bad Request',
              response: error.response,
            });
          }
        },
      });

      try {
        // when
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        // then
        expect(error).toBeInstanceOf(BadRequestError);
        if (error instanceof BadRequestError) {
          expect(error.message).toBe('Bad Request');
        }
      }
    });
  });
});

class HttpError extends Error {
  constructor(
    readonly statusCode?: number,
    message?: string,
    readonly response?: Response,
  ) {
    super(message);
  }
}

type ErrorConstrutor = {
  message?: string;
  statusCode?: number;
  response?: Response;
};

class BadRequestError extends HttpError {
  constructor({
    message = 'Bad Request',
    statusCode = 400,
    response,
  }: ErrorConstrutor) {
    super(statusCode, message, response);
    this.name = 'BadRequestError';
  }
}
