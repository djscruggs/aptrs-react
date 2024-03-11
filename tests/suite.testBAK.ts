import { assert, describe, expect, it } from 'vitest'

import * as factory from './factory';

describe('create and update users',  () => {
  it('creates a regular user', () => {
    beforeAll(async () => {
      console.log('beforeAll')
      global.normalUser = await factory.createNormalUser()
      global.adminUser = await factory.createAdminUser()
      
    });
    expect(global.normalUser).toEqual(1)
    expect(global.adminUser).toEqual(2)
    
    
    
  })

  it('bar', () => {
    expect(1 + 1).eq(3)
  })

  it('snapshot', () => {
    expect({ foo: 'bar' }).toMatchSnapshot()
  })
})
