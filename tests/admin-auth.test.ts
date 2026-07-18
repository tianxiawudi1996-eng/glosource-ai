import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adminPathDecision,
  isAdminEmail,
} from '../app/lib/admin-auth';

test('admin email matching is normalized and fails closed without configuration', () => {
  assert.equal(isAdminEmail('OWNER@EXAMPLE.COM', 'owner@example.com, ops@example.com'), true);
  assert.equal(isAdminEmail('user@example.com', 'owner@example.com'), false);
  assert.equal(isAdminEmail('owner@example.com', ''), false);
  assert.equal(isAdminEmail(null, 'owner@example.com'), false);
});

test('admin path decisions allow the login page but require an admin elsewhere', () => {
  const admins = 'owner@example.com';
  assert.equal(adminPathDecision('/admin/login', null, admins), 'public-login');
  assert.equal(adminPathDecision('/admin', null, admins), 'unauthenticated');
  assert.equal(adminPathDecision('/admin/suppliers', 'user@example.com', admins), 'forbidden');
  assert.equal(adminPathDecision('/admin/suppliers', 'owner@example.com', admins), 'authorized');
  assert.equal(adminPathDecision('/administrator', null, admins), 'not-admin-path');
});
