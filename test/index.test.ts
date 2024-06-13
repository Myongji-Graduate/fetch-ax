import { nextFetch } from '../src';

describe('next-fetch', () => {
  it('should call global fetch when no default options.', async () => {
    const instance = nextFetch.create();

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(instance).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers(),
      },
    );
  });
  it('should apply baseUrl.', async () => {
    const instance = nextFetch.create({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });

    // when
    await instance.get('/todos/1');

    // then
    expect(instance).toHaveBeenCalledWith(
      new URL('https://jsonplaceholder.typicode.com/todos/1'),
      {
        headers: new Headers(),
      },
    );
  });
  it('should apply baseUrl.', async () => {
    const instance = nextFetch.create({
      baseURL: 'https://jsonplaceholder.typicode.com',
    });

    // when
    await instance.get('/todos/1');

    // then
    expect(instance).toHaveBeenCalledWith(
      new URL('https://jsonplaceholder.typicode.com/todos/1'),
      {
        headers: new Headers(),
      },
    );
  });
  it('should apply default headers.', async () => {
    // given
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1');

    // then
    expect(instance).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      },
    );
  });
  it('should override default headers', async () => {
    // given
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(instance).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos/1',
      {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    );
  });
  it('should call request, response interceptors', async () => {
    // given
    const requestInterceptor = (requestInit: RequestInit) => {
      return requestInit;
    };
    const responseInterceptor = (response: Response) => {
      return Response;
    };
    const instance = nextFetch.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      requestInterceptor: requestInterceptor,
      responseInterceptor: responseInterceptor,
    });

    // when
    await instance.get('https://jsonplaceholder.typicode.com/todos/1', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    expect(requestInterceptor).toHaveBeenCalledWith();
    expect(responseInterceptor).toHaveBeenCalled();
  });
  it('should throw error', async () => {
    // given
    const instance = nextFetch.create({
      throwError: true,
    });

    expect(
      await instance.get('https://jsonplaceholder.typicode.com/Error/1'),
    ).toThrow();
  });
  it('should throw error', async () => {
    // given
    const instance = nextFetch.create({
      responseType: 'json',
    });
    const data = await instance.get(
      'https://jsonplaceholder.typicode.com/Error/1',
    );
    expect(typeof data).toEqual(typeof JSON);
  });
});
