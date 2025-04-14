import { ApplicationException } from '../../../lib/exceptions/application-exception';

describe('ApplicationException', () => {
  it('should create an instance with message, statusCode and code', () => {
    const error = new ApplicationException(
      'Something went wrong',
      400,
      'BAD_REQUEST',
    );

    expect(error).toBeInstanceOf(ApplicationException);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.name).toBe('ApplicationException');
  });

  it('should allow creating an instance without code', () => {
    const error = new ApplicationException('Another error', 404);

    expect(error).toBeInstanceOf(ApplicationException);
    expect(error.message).toBe('Another error');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBeUndefined();
  });
});
