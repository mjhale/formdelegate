import assert from 'node:assert/strict';
import test from 'node:test';

import {
  invitationAcceptancePath,
  safeRedirectPath,
} from '../app/utils/destination.ts';

test('safeRedirectPath rejects protocol-relative destinations', () => {
  assert.equal(safeRedirectPath('//evil.example', '/fallback'), '/fallback');
  assert.equal(safeRedirectPath('/%2Fevil.example', '/fallback'), '/fallback');
});

test('safeRedirectPath rejects backslash-prefixed destinations', () => {
  assert.equal(safeRedirectPath('/\\evil.example', '/fallback'), '/fallback');
});

test('safeRedirectPath rejects encoded backslash destinations', () => {
  assert.equal(safeRedirectPath('/%5Cevil.example', '/fallback'), '/fallback');
  assert.equal(
    safeRedirectPath('/%255Cevil.example', '/fallback'),
    '/fallback'
  );
});

test('safeRedirectPath rejects raw and encoded control characters', () => {
  assert.equal(safeRedirectPath('/dashboard\n', '/fallback'), '/fallback');
  assert.equal(safeRedirectPath('/dashboard%0A', '/fallback'), '/fallback');
});

test('safeRedirectPath allows normal internal paths', () => {
  assert.equal(safeRedirectPath('/dashboard', '/fallback'), '/dashboard');
  assert.equal(
    safeRedirectPath('/account/team?tab=members#pending', '/fallback'),
    '/account/team?tab=members#pending'
  );
});

test('safeRedirectPath allows generated invitation acceptance destinations', () => {
  const destination = invitationAcceptancePath('invite-token.abc123');

  assert.equal(
    destination,
    '/team-invitations/accept?token=invite-token.abc123'
  );
  assert.equal(safeRedirectPath(destination, '/fallback'), destination);
});
