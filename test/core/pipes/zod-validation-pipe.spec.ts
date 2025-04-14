import { ZodValidationPipe } from '../../../lib/pipes/zod-validation-pipe';
import { ApplicationException } from '../../../lib/exceptions/application-exception';
import { z } from 'zod';
import { MicroserviceRequest } from '../../../lib/interfaces/microservice-request';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number().min(0),
  });

  let pipe: ZodValidationPipe<typeof schema>;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('should validate and transform valid data', () => {
    const payload: MicroserviceRequest = {
      data: { name: 'John Doe', age: 30 },
      metadata: {},
    };

    const result = pipe.transform(payload);

    expect(result.data).toEqual({ name: 'John Doe', age: 30 });
  });

  it('should throw ApplicationException on invalid data', () => {
    const payload: MicroserviceRequest = {
      data: { name: 'John Doe', age: -5 },
      metadata: {},
    };

    expect(() => pipe.transform(payload)).toThrow(ApplicationException);
    try {
      pipe.transform(payload);
    } catch (error) {
      if (error instanceof ApplicationException) {
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toContain('greater than or equal to 0');
      } else {
        throw error;
      }
    }
  });

  it('should throw ApplicationException if required field is missing', () => {
    const payload: MicroserviceRequest = {
      data: { age: 25 },
      metadata: {},
    };

    expect(() => pipe.transform(payload)).toThrow(ApplicationException);
  });
});
