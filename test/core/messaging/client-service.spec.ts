import { ClientService } from '../../../lib/messaging/client-service';
import { ClientKafkaProxy, ClientProxy } from '@nestjs/microservices';
import { of, throwError, TimeoutError } from 'rxjs';
import { ApplicationException } from '../../../lib/exceptions/application-exception';

describe('ClientService', () => {
  let clientService: ClientService;
  let clientProxyMock: jest.Mocked<ClientKafkaProxy>;

  beforeEach(() => {
    clientProxyMock = {
      send: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
    } as any;

    clientService = new ClientService(clientProxyMock);
  });

  it('should return Ok result when microservice responds successfully', async () => {
    const responseData = { message: 'success' };
    const payload = {
      data: { payload: 'test' },
      metadata: {},
    };
    clientProxyMock.send.mockReturnValueOnce(of(responseData));

    const result = await clientService.apply<{ payload: string }>(
      'test_command',
      payload,
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual(responseData);
    expect(clientProxyMock.send).toHaveBeenCalledWith('test_command', payload);
  });

  it('should return Err result when microservice responds with error', async () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 400,
      code: 'BAD_REQUEST',
    };
    clientProxyMock.send.mockReturnValueOnce(throwError(() => error));
    const payload = {
      data: { payload: 'test' },
      metadata: {},
    };
    const result = await clientService.apply('test_command', payload);

    expect(result.isErr()).toBe(true);
    expect(result.getErr()).toBeInstanceOf(ApplicationException);
    expect(result.getErr()?.message).toBe('Something went wrong');
    expect((result.getErr() as ApplicationException)?.statusCode).toBe(400);
    expect((result.getErr() as ApplicationException)?.code).toBe('BAD_REQUEST');
  });

  it('should return Err with TIMEOUT when microservice times out', async () => {
    clientProxyMock.send.mockReturnValueOnce(
      throwError(() => new TimeoutError()),
    );

    const payload = {
      data: { payload: 'test' },
      metadata: {},
    };
    const result = await clientService.apply('test_command', payload);

    expect(result.isErr()).toBe(true);
    expect(result.getErr()).toBeInstanceOf(ApplicationException);
    expect(result.getErr()?.message).toBe('Request timed out');
    expect((result.getErr() as ApplicationException)?.statusCode).toBe(504);
    expect((result.getErr() as ApplicationException)?.code).toBe('TIMEOUT');
  });
});
