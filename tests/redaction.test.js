import { test } from 'node:test';
import assert from 'node:assert';
import { redactSensitive, redactPayload } from '../server/services/automation/redaction.js';

test('Redact SSN, Routing, and Account Numbers', () => {
  assert.strictEqual(redactSensitive('123456789', 'ssn'), '***-**-6789');
  assert.strictEqual(redactSensitive('123456789', 'routing'), '*****6789');
  assert.strictEqual(redactSensitive('123456789', 'account'), '******6789');
  assert.strictEqual(redactSensitive('secret-password', 'password'), '[REDACTED]');
});

test('Recursively Redact Payload', () => {
  const payload = {
    firstName: 'John',
    ssn: '123456789',
    routingNumber: '987654321',
    nested: {
      accountNumber: '1122334455',
      password: 'mypassword',
    }
  };

  const redacted = redactPayload(payload);
  assert.strictEqual(redacted.firstName, 'John');
  assert.strictEqual(redacted.ssn, '***-**-6789');
  assert.strictEqual(redacted.routingNumber, '*****4321');
  assert.strictEqual(redacted.nested.accountNumber, '******4455');
  assert.strictEqual(redacted.nested.password, '[REDACTED]');
});
