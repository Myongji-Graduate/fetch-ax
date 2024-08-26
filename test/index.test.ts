import { default as fetchAX, fetchAxError, RequestInit } from '../src';

describe('next-fetch', () => {
  const globalFetch = global.fetch;
  let fetchMocked: jest.Mock;
  let mockRequestInterceptor: jest.Mock;
  let mockResponseInterceptor: jest.Mock;

  beforeEach(() => {
    fetchMocked = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        userId: 1,
        id: 1,
        title: 'delectus aut autem',
        completed: false,
      }),
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
        throwError: false,
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
          'Content-Type': 'application/json',
          accept: 'application/json',
        }),
        method: 'GET',
        throwError: false,
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
        throwError: false,
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
    expect(error).toBeInstanceOf(fetchAxError);
  });
  describe('interceptor', () => {
    it('return promise reject error', async () => {
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            return Promise.reject({ error: 'error' });
          }
        },
      });

      try {
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        expect(error).toEqual({
          error: 'error',
        });
      }
    });

    it('throw reject error', async () => {
      const instance = fetchAX.create({
        throwError: true,
        responseRejectedInterceptor: (error) => {
          if (error.statusCode === 300) {
            throw { error: 'error' };
          }
        },
      });

      try {
        await instance.get('https://jsonplaceholder.typicode.com/Error/1');
      } catch (error) {
        expect(error).toEqual({
          error: 'error',
        });
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
