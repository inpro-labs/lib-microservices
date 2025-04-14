import { PipeTransform, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { MicroserviceRequest } from '../interfaces/microservice-request';
import { ApplicationException } from '../exceptions/application-exception';

/**
 * A validation pipe that uses Zod schemas to validate the `data` field
 * of a microservice request.
 *
 * @template T - A Zod schema used for validation.
 */
@Injectable()
export class ZodValidationPipe<T extends ZodSchema<unknown>>
  implements PipeTransform
{
  /**
   * Creates a new instance of `ZodValidationPipe`.
   *
   * @param {T} schema - The Zod schema used to validate the incoming request data.
   */
  constructor(private schema: T) {}

  /**
   * Validates the `data` field of the incoming microservice request.
   *
   * If validation succeeds, returns the modified payload with parsed data.
   * If validation fails, throws an `ApplicationException` with the first validation error.
   *
   * @param {MicroserviceRequest} payload - The incoming microservice request.
   * @returns {MicroserviceRequest} The validated and possibly transformed request payload.
   * @throws {ApplicationException} If validation fails.
   */
  transform(payload: MicroserviceRequest): MicroserviceRequest {
    const result = this.schema.safeParse(payload.data);

    if (!result.success) {
      const firstError = result.error.errors[0];

      const fieldPath = firstError.path.join('.');
      const errorMessage = firstError.message;

      const finalMessage = fieldPath
        ? `Field '${fieldPath}': ${errorMessage}`
        : errorMessage;

      throw new ApplicationException(finalMessage, 400, 'VALIDATION_ERROR');
    }

    payload.data = result.data;

    return payload;
  }
}
