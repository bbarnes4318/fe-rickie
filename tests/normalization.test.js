import { test } from 'node:test';
import assert from 'node:assert';
import { 
  normalizePlanType, 
  normalizeBoolean, 
  normalizeAccountType, 
  normalizeDraftDay, 
  parseHeight, 
  normalizeDob, 
  validateAndNormalizePayload 
} from '../server/services/automation/normalization.js';

test('Plan Type Normalization', () => {
  assert.strictEqual(normalizePlanType('I'), 'Level');
  assert.strictEqual(normalizePlanType('Immediate'), 'Level');
  assert.strictEqual(normalizePlanType('level'), 'Level');
  assert.strictEqual(normalizePlanType('L'), 'Level');
  assert.strictEqual(normalizePlanType('G'), 'Graded');
  assert.strictEqual(normalizePlanType('Graded'), 'Graded');
  assert.strictEqual(normalizePlanType('R'), 'ROP');
  assert.strictEqual(normalizePlanType('Return of Premium'), 'ROP');
});

test('Boolean Normalization', () => {
  assert.strictEqual(normalizeBoolean(true), true);
  assert.strictEqual(normalizeBoolean('true'), true);
  assert.strictEqual(normalizeBoolean('Yes'), true);
  assert.strictEqual(normalizeBoolean('Y'), true);
  assert.strictEqual(normalizeBoolean('1'), true);
  assert.strictEqual(normalizeBoolean(false), false);
  assert.strictEqual(normalizeBoolean('No'), false);
  assert.strictEqual(normalizeBoolean(null), false);
});

test('Account Type Normalization', () => {
  assert.strictEqual(normalizeAccountType('Savings'), 'Saving');
  assert.strictEqual(normalizeAccountType('Saving'), 'Saving');
  assert.strictEqual(normalizeAccountType('checking'), 'Checking');
  assert.strictEqual(normalizeAccountType(null), 'Checking');
});

test('Draft Day Normalization', () => {
  assert.strictEqual(normalizeDraftDay('1S', true), '1S');
  assert.strictEqual(normalizeDraftDay('3S', true), '3S');
  assert.strictEqual(normalizeDraftDay('15', true), '1S'); // fallback for SS schedule
  assert.strictEqual(normalizeDraftDay('15', false), '15');
  assert.strictEqual(normalizeDraftDay('5', false), '5');
  assert.strictEqual(normalizeDraftDay('32', false), '15'); // out of bounds fallback
});

test('Height Parsing', () => {
  assert.deepStrictEqual(parseHeight("5'9\""), { feet: 5, inches: 9 });
  assert.deepStrictEqual(parseHeight("5'9"), { feet: 5, inches: 9 });
  assert.deepStrictEqual(parseHeight("5-9"), { feet: 5, inches: 9 });
  assert.deepStrictEqual(parseHeight("6"), { feet: 6, inches: 0 });
});

test('DOB Normalization', () => {
  assert.strictEqual(normalizeDob('1970-05-15'), '05/15/1970');
  assert.strictEqual(normalizeDob('05/15/1970'), '05/15/1970');
});

test('Payload Validation - Missing Fields', () => {
  const result = validateAndNormalizePayload({});
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.includes('First Name is required'));
  assert.ok(result.errors.includes('Last Name is required'));
});

test('Payload Validation - Valid Fields', () => {
  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    dob: '1970-05-15',
    gender: 'Male',
    tobacco: false,
    state: 'Illinois',
    address: '123 Main St',
    city: 'Chicago',
    zip: '60601',
    phone: '555-123-4567',
    weight: 180,
    plan: 'Level',
    faceAmount: 15000,
    primaryBenName: 'Jane Doe',
    primaryBenRel: 'Spouse',
    bankName: 'Chase',
    bankAddress: 'Chicago/IL',
    draftDate: '15',
    routing: '021000021',
    accountNum: '12345678',
    accountType: 'Checking',
  };

  const result = validateAndNormalizePayload(validPayload);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.normalized.firstName, 'John');
  assert.strictEqual(result.normalized.selectedPlanType, 'Level');
  assert.strictEqual(result.normalized.routingNumber, '021000021');
  assert.strictEqual(result.normalized.weight, 180);
});
