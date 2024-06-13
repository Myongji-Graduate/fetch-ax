class NextFetchError extends Error {
  constructor(
    readonly statusCode: number,
    readonly response: Response,
  ) {
    super();
    this.statusCode = statusCode;
    this.response = response;
  }
}

const httpErrorHandling = (response: Response) => {
  if (response.status >= 300)
    throw new NextFetchError(response.status, response);
};
