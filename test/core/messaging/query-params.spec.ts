// zod-query-params.spec.ts
import { z } from 'zod';
import {
  zodQueryParams,
  ZodQueryParamsSchema,
} from '../../../lib/messaging/query-params';

describe('ZodQueryParamsSchema', () => {
  it('should validate pagination and orderBy correctly', () => {
    const result = ZodQueryParamsSchema.parse({
      pagination: { take: 10, skip: 20 },
      orderBy: { name: 'asc', createdAt: 'desc' },
      search: 'test search',
    });

    expect(result.pagination?.take).toBe(10);
    expect(result.pagination?.skip).toBe(20);
    expect(result.orderBy?.name).toBe('asc');
    expect(result.orderBy?.createdAt).toBe('desc');
    expect(result.search).toBe('test search');
  });

  it('should fail if orderBy has invalid value', () => {
    expect(() =>
      ZodQueryParamsSchema.parse({
        orderBy: { name: 'ascending' },
      }),
    ).toThrow();
  });

  it('should allow missing optional fields', () => {
    const result = ZodQueryParamsSchema.parse({
      pagination: { take: 5 },
    });

    expect(result.pagination?.take).toBe(5);
    expect(result.pagination?.skip).toBeUndefined();
    expect(result.orderBy).toBeUndefined();
    expect(result.search).toBeUndefined();
  });
});

describe('zodQueryParams', () => {
  const ExampleSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE']),
  });

  const CombinedSchema = zodQueryParams(ExampleSchema);

  it('should validate base schema with pagination, orderBy, and search', () => {
    const result = CombinedSchema.parse({
      data: {
        status: 'ACTIVE',
      },
      pagination: { take: 10, skip: 0 },
      orderBy: { createdAt: 'desc' },
      search: 'active users',
    });

    expect(result.data.status).toBe('ACTIVE');
    expect(result.pagination?.take).toBe(10);
    expect(result.orderBy?.createdAt).toBe('desc');
    expect(result.search).toBe('active users');
  });

  it('should fail if base schema fields are missing', () => {
    expect(() =>
      CombinedSchema.parse({
        pagination: { take: 10, skip: 0 },
      }),
    ).toThrow();
  });

  it('should allow optional pagination and search', () => {
    const result = CombinedSchema.parse({
      data: {
        status: 'INACTIVE',
      },
    });

    expect(result.data.status).toBe('INACTIVE');
    expect(result.pagination).toBeUndefined();
    expect(result.search).toBeUndefined();
    expect(result.orderBy).toBeUndefined();
  });
});
