import test from 'node:test';
import assert from 'node:assert/strict';
import { compact, elapsed } from './format.mjs';

test('large values use one decimal and promote rounded unit boundaries', () => {
  assert.equal(compact(1000), '1.0K');
  assert.equal(compact(1250000), '1.3M');
  assert.equal(compact(1000000000), '1.0B');
  assert.equal(compact(999950), '1.0M');
  assert.equal(compact(.02), '0.02');
  assert.equal(elapsed(3661), '1 小时 1 分 1 秒');
});
