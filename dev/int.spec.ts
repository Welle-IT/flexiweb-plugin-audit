import type { Field } from 'payload'

import { describe, expect, it } from 'vitest'

import { computeAuditDiff } from '../src/utils.js'

// Payload-style field config structure
const fields: Field[] = [
  { name: 'title', type: 'text' },

  // global redact
  { name: 'password', type: 'text' },

  // per-field redact
  {
    name: 'secret',
    type: 'text',
    custom: { flexiweb: { audit: { isRedacted: true } } },
  },

  // relationship + redaction
  {
    name: 'user',
    type: 'relationship',
    custom: { flexiweb: { audit: { isRedacted: true, path: 'user' } } },
    relationTo: 'users',
  },
  {
    // FULL GROUP REDACTI
    name: 'redactedGroup',
    type: 'group',
    custom: { flexiweb: { audit: { isRedacted: true, path: 'redactedGroup' } } },
    fields: [
      { name: 'g1', type: 'text' },
      { name: 'g2', type: 'text' },
    ],
  },

  // PARTIAL GROUP REDACTION
  {
    name: 'partlyRedactedGroup',
    type: 'group',
    fields: [
      {
        name: 'g1',
        type: 'text',
        custom: { flexiweb: { audit: { isRedacted: true, path: 'partlyRedactedGroup.g1' } } },
      },
      { name: 'g2', type: 'text' },
      {
        name: 'g3',
        type: 'relationship',
        hasMany: true,
        relationTo: 'users',
      },
    ],
  },

  // NESTED GROUP
  {
    name: 'nested',
    type: 'group',
    fields: [
      { name: 'a', type: 'text' },
      {
        name: 'b',
        type: 'text',
        custom: { flexiweb: { audit: { isRedacted: true, path: 'nested.b' } } },
      },
    ],
  },

  // IGNORE ENTIRE GROUP
  {
    name: 'audit',
    type: 'group',
    custom: { flexiweb: { audit: { ignore: true, path: 'audit' } } },
    fields: [
      { name: 'createdAt', type: 'date' },
      { name: 'updatedAt', type: 'date' },
    ],
  },
]

describe('computeAuditDiff', () => {
  it('detects simple changed fields', () => {
    const before = { title: 'Hello' }
    const after = { title: 'World' }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(b.title).toBe('Hello')
    expect(a.title).toBe('World')
  })

  it('redacts global sensitive keys', () => {
    const before = { password: 'abc123' }
    const after = { password: 'xyz789' }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(a.password).toBe('REDACTED')
    expect(b.password).toBe('REDACTED')
  })

  it('redacts per-field (custom.isRedacted)', () => {
    const before = { secret: 'super' }
    const after = { secret: 'mega' }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(a.secret).toBe('REDACTED')
    expect(b.secret).toBe('REDACTED')
  })

  it('handles relationship → ID conversion with redaction', () => {
    const before = {
      user: { id: 'u1', email: 'test@example.com' },
    }
    const after = {
      user: { id: 'u2', email: 'foo@example.com' },
    }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(a.user).toBe('REDACTED')
    expect(b.user).toBe('REDACTED')
  })

  it('ignores fields fully (removed from diff)', () => {
    const before = {
      audit: { createdAt: '2020', updatedAt: '2021' },
    }
    const after = {
      audit: { createdAt: '2022', updatedAt: '2023' },
    }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(a.audit).toBeUndefined()
    expect(b.audit).toBeUndefined()
  })

  // -------------------------------
  // FULL GROUP REDACTION
  // -------------------------------
  it('redacts full groups when isRedacted = true on group', () => {
    const before = {
      redactedGroup: { g1: 'one', g2: 'two' },
    }
    const after = {
      redactedGroup: { g1: 'x', g2: 'y' },
    }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(a.redactedGroup).toBe('REDACTED')
    expect(b.redactedGroup).toBe('REDACTED')
  })

  // -------------------------------
  // PARTIAL GROUP REDACTION
  // -------------------------------
  it('redacts only specific fields inside partly-redacted groups', () => {
    const before = {
      partlyRedactedGroup: {
        g1: 'secretBefore',
        g2: 'keepBefore',
        g3: [{ id: 'u1' }, { id: 'u2' }],
      },
    }

    const after = {
      partlyRedactedGroup: {
        g1: 'secretAfter',
        g2: 'keepAfter',
        g3: [{ id: 'u3' }],
      },
    }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    // g1 must be redacted
    expect(a.partlyRedactedGroup.g1).toBe('REDACTED')
    expect(b.partlyRedactedGroup.g1).toBe('REDACTED')

    // g2 must show actual diff
    expect(a.partlyRedactedGroup.g2).toBe('keepAfter')
    expect(b.partlyRedactedGroup.g2).toBe('keepBefore')

    // g3: relationship IDs but NOT redacted
    expect(a.partlyRedactedGroup.g3).toEqual(['u3'])
    expect(b.partlyRedactedGroup.g3).toEqual(['u1', 'u2'])
  })

  // -------------------------------
  // MIXED NESTED DIFF
  // -------------------------------
  it('handles nested groups + mixed redaction rules', () => {
    const before = {
      nested: { a: 'hello', b: 'secretBefore' },
    }
    const after = {
      nested: { a: 'world', b: 'secretAfter' },
    }

    const { after: a, before: b } = computeAuditDiff(before, after, fields)

    expect(b.nested.a).toBe('hello')
    expect(a.nested.a).toBe('world')

    // b is aftecedaonbeyorva ber-field rules
    expect(a.nested.b).toBe('REDACTED')
    expect(b.nested.b).toBe('REDACTED')
  })
})
