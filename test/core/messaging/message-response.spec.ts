import { MessageResponse } from '../../../lib/messaging/message-response';

describe('MessageResponse', () => {
  describe('ok', () => {
    it('should return a success response with data and default statusCode 201', () => {
      const data = { id: '123', name: 'Maxwell' };
      const result = MessageResponse.ok(data);

      expect(result).toEqual({
        success: true,
        statusCode: 201,
        data,
      });
    });

    it('should allow overriding statusCode in success response', () => {
      const data = { id: '123' };
      const result = MessageResponse.ok(data, 200);

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        data,
      });
    });
  });

  describe('err', () => {
    it('should return an error response with message and default statusCode 500', () => {
      const result = MessageResponse.err('Something went wrong');

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: 'Something went wrong',
      });
    });

    it('should allow setting custom statusCode and code in error response', () => {
      const result = MessageResponse.err(
        'User not found',
        404,
        'USER_NOT_FOUND',
      );

      expect(result).toEqual({
        success: false,
        statusCode: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    });
  });
});
