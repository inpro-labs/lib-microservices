import { MicroserviceResponse } from '../interfaces/microservice-response';

/**
 * Utility class for creating standardized microservice responses.
 */
export class MessageResponse {
  /**
   * Creates a successful response.
   *
   * @template T - The type of the data payload.
   * @param {T} data - The response payload.
   * @param {number} [statusCode=201] - Optional HTTP status code (default is 201).
   * @returns {MicroserviceResponse<T>} The standardized success response.
   */
  static ok<T = unknown>(
    data: T,
    statusCode: number = 201,
  ): MicroserviceResponse<T> {
    return { success: true, statusCode, data: data };
  }

  /**
   * Creates an error response.
   *
   * @param {string} message - The error message.
   * @param {string} [code] - Optional error code.
   * @param {number} [statusCode=500] - Optional HTTP status code (default is 500).
   * @returns {MicroserviceResponse} The standardized error response.
   */
  static err(
    message: string,
    statusCode: number = 500,
    code?: string,
  ): MicroserviceResponse {
    return { success: false, statusCode, message, code };
  }
}
