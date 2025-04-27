import { ClientKafkaProxy } from '@nestjs/microservices';
import { ApplicationException } from '../exceptions/application-exception';
import { MicroserviceRequest } from '../interfaces/microservice-request';
import { Result, Err, Ok } from '@inpro-labs/core';
import { timeout } from 'rxjs/operators';
import { firstValueFrom, TimeoutError } from 'rxjs';

/**
 * Service to encapsulate and standardize microservice communication via ClientProxy.
 */
export class ClientService {
  /**
   * Creates an instance of ClientService.
   *
   * @param {ClientKafkaProxy} client - The microservice client proxy used to send messages.
   */
  constructor(private readonly client: ClientKafkaProxy) {}

  /**
   * Factory method to create a new ClientService from a ClientProxy.
   *
   * @returns {(clientProxy: ClientProxy) => ClientService} A function that takes a ClientProxy and returns a ClientService.
   */
  static fromFactory(): (clientProxy: ClientKafkaProxy) => ClientService {
    return (clientProxy: ClientKafkaProxy) => new ClientService(clientProxy);
  }

  /**
   * Sends a command to the microservice and returns a standardized Result.
   *
   * Applies a 30-second timeout to the request.
   * If the microservice times out or throws an error, returns an ApplicationException wrapped in Err.
   *
   * @template T - The type of the request payload.
   * @param {string} command - The command or pattern name to send to the microservice.
   * @param {MicroserviceRequest<T>} payload - The payload to send with the command.
   * @returns {Promise<Result<unknown>>} A Result containing either the successful response or a standardized error.
   */
  async apply<T>(
    command: string,
    payload: MicroserviceRequest<T>,
  ): Promise<Result<unknown>> {
    try {
      const source$ = this.client
        .send<unknown>(command, payload)
        .pipe(timeout(30000));

      const data = await firstValueFrom<unknown>(source$);

      return Ok(data);
    } catch (error) {
      const err = error as {
        message: string;
        statusCode: number;
        code: string;
      };

      if (error instanceof TimeoutError) {
        return Err(
          new ApplicationException('Request timed out', 504, 'TIMEOUT'),
        );
      }

      return Err(
        new ApplicationException(err.message, err.statusCode, err.code),
      );
    }
  }
}
