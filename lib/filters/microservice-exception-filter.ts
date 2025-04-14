import { Catch, Logger, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { MicroserviceResponse } from '../interfaces/microservice-response';
import { MessageResponse } from '../messaging/message-response';
import { ApplicationException } from '../exceptions/application-exception';
import { ZodError } from 'zod';

/**
 * A global exception filter for microservices that catches and transforms exceptions
 * into standardized microservice error responses.
 *
 * Handles:
 * - Validation errors (Zod)
 * - Application exceptions
 * - Unhandled exceptions (logs them)
 */
@Catch()
export class MicroserviceExceptionFilter implements RpcExceptionFilter {
  /**
   * Catches exceptions thrown during microservice communication
   * and transforms them into a `MicroserviceResponse` error format.
   *
   * @param {any} exception - The thrown exception.
   * @returns {Observable<MicroserviceResponse<any>>} An observable that emits the error response.
   */
  catch(exception: any): Observable<MicroserviceResponse<any>> {
    let response: MicroserviceResponse<any>;

    if (exception instanceof ZodError) {
      response = MessageResponse.err(
        exception.errors[0].message,
        400,
        'VALIDATION_ERROR',
      );
    } else if (exception instanceof ApplicationException) {
      response = MessageResponse.err(
        exception.message,
        exception.statusCode,
        exception.code,
      );
    } else {
      const logger = new Logger('Unhandled Error');

      logger.error(exception);

      response = MessageResponse.err(
        'Internal server error',
        500,
        'INTERNAL_SERVER_ERROR',
      );
    }

    return throwError(() => response);
  }
}
