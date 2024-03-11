import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest';
import * as factory from './factory';
import * as definitions from '../src/lib/data/definitions';
import * as api from '../src/lib/data/api';
const BEFORE_ALL_TIMEOUT = 30000; // 30 sec

describe('Login and verify user has API access', () => {
  let adminUser: definitions.LoginUser
  beforeAll(async () => {
    adminUser = await factory.loginAdminUser()
  }, BEFORE_ALL_TIMEOUT);
  test('User should be admin', () => {
    expect(adminUser.isAdmin).toBe(true);
    
  });
  test ('User exists in api local instance', () => {
    expect(api.getAuthUser()).toBeTruthy()
  })
  test('User should have access and refresh tokens', () => {
    expect(adminUser).toEqual(
      expect.objectContaining({ access: expect.anything() }),
    )
    expect(adminUser).toEqual(
      expect.objectContaining({ refresh: expect.anything() }),
    )    
  });
  
});