export type OkResponse<T = unknown> = {
  success: true;
  statusCode: number;
  message?: undefined;
  data: T;
};

export type ErrResponse = {
  success: false;
  statusCode: number;
  message: string;
  code?: string;
  data?: undefined;
};

/**
 * Union type for microservice responses,
 * either a success with data or an error with a message.
 *
 * @template T - The type of the success payload.
 */
export type MicroserviceResponse<T = unknown> = OkResponse<T> | ErrResponse;
