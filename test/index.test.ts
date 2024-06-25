import { nextFetch, RequestInit } from '../src';

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

  it('should call global fetch when no default options.', async () => {
    // given
    const instance = nextFetch.create();

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
    const instance = nextFetch.create({
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
    const instance = nextFetch.create({
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
    const instance = nextFetch.create({
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

  it('should throw error', async () => {
    // given
    const instance = nextFetch.create({
      throwError: true,
    });
    // when
    const result = await instance.get(
      'https://jsonplaceholder.typicode.com/Error/1',
    );
    // then
    expect(result.data).toEqual(undefined);
  });

  it('should throw error', async () => {
    // given
    const instance = nextFetch.create({
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
