export interface Metadata {
  authorization?: string;
  requestId?: string;
  correlationId?: string;
  [key: string]: string | undefined;
}

export interface MicroserviceRequest<T = any> {
  metadata: Metadata;
  data: T;
}
