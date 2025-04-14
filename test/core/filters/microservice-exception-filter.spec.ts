import { MicroserviceExceptionFilter } from '../../../lib/filters/microservice-exception-filter';
import { ApplicationException } from '../../../lib/exceptions/application-exception';
import { ZodError, z } from 'zod';
import { Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

describe('MicroserviceExceptionFilter', () => {
  let filter: MicroserviceExceptionFilter;

  beforeEach(() => {
    filter = new MicroserviceExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  it('should handle ZodError and return a validation error response', async () => {
    const schema = z.object({
      name: z.string(),
    });

    let caughtError;
    try {
      schema.parse({});
    } catch (zodError) {
      caughtError = zodError;
    }

    const result$ = filter.catch(caughtError);
    const error = await lastValueFrom(result$).catch((err) => err);

    expect(error).toEqual({
      success: false,
      statusCode: 400,
      message: expect.any(String),
      code: 'VALIDATION_ERROR',
    });
  });

  it('should handle ApplicationException and return its properties', async () => {
    const appError = new ApplicationException(
      'App error occurred',
      403,
      'APP_ERROR',
    );

    const result$ = filter.catch(appError);
    const error = await lastValueFrom(result$).catch((err) => err);

    expect(error).toEqual({
      success: false,
      statusCode: 403,
      message: 'App error occurred',
      code: 'APP_ERROR',
    });
  });

  it('should handle unknown errors and return an internal server error response', async () => {
    const unknownError = new Error('Unknown error');

    const result$ = filter.catch(unknownError);
    const error = await lastValueFrom(result$).catch((err) => err);

    expect(Logger.prototype.error).toHaveBeenCalledWith(unknownError);

    expect(error).toEqual({
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
