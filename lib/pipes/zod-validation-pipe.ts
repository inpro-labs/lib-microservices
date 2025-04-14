import { PipeTransform, Injectable } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';
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
    try {
      const validatedData = this.schema.parse(payload.data);

      payload.data = validatedData;

      return payload;
    } catch (error) {
      throw new ApplicationException(
        (error as ZodError).errors[0].message,
        400,
        'VALIDATION_ERROR',
      );
    }
  }
}
