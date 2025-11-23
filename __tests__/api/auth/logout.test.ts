/**
 * Tests for POST /api/auth/logout
 * User Logout Endpoint
 */

import { POST } from '@/app/api/auth/logout/route';
import { createMockRequest, parseJsonResponse } from '@/__tests__/utils/test-helpers';

describe('POST /api/auth/logout', () => {
  it('should logout successfully and clear cookies', async () => {
    const request = createMockRequest({
      method: 'POST',
    });

    const response = await POST(request);
    const data = await parseJsonResponse(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout successful');

    // Check cookies are cleared
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('auth-token=;');
    expect(cookies).toContain('Max-Age=0');
  });
});
