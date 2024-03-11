import { assert, expect, test } from 'vitest'
import { squared } from './basic.js'

// Edit an assertion and save to see HMR in action

test("ENV setup", () => {
  expect(process.env.NODE_ENV).toBe('test')
  expect(process.env.VITE_APP_API_URL).toBe('https://aptrsapi.souravkalal.tech/api/')
})

test('Squared', () => {
  expect(squared(2)).toBe(4)
  expect(squared(12)).toBe(144)
})

test('JSON', () => {
  const input = {
    foo: 'hello',
    bar: 'world'
  }

  const output = JSON.stringify(input)

  expect(output).eq('{"foo":"hello","bar":"world"}')
  assert.deepEqual(JSON.parse(output), input, 'matches original')
})
