import { hasAdminFieldLevelAccess } from '@flexiweb/core/access'
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  type CollapsibleField,
  type DateField,
  deepMerge,
  type Field,
  type GroupField,
  type PayloadRequest,
  type TextField,
} from 'payload'

import type {
  AuditActionType,
  AuditGroupFieldOverrides,
  AuditGroupFieldPublishedAtOverrides,
  AuditGroupFieldPublishedByOverrides,
  AuditGroupFieldUpdatedAtOverrides,
  AuditGroupFieldUpdatedByOverrides,
  AuditPluginConfig,
  AuditType,
} from './types.js'

import { GLOBAL_IGNORE_KEYS, GLOBAL_REDACT_KEYS } from './constants.js'

export function processAuditGroupFields(
  fields: Field[],
  pluginConfig: AuditPluginConfig,
  hasDrafts: boolean,
) {
  const publishedFields: Field[] = []
  if (hasDrafts) {
    const publishedBy: TextField = deepMerge<TextField, AuditGroupFieldPublishedByOverrides>(
      {
        name: 'publishedBy',
        type: 'text',
        access: {
          create: () => false,
          read: hasAdminFieldLevelAccess,
          update: () => false,
        },
        label: {
          de: 'Veröffentlicht von',
          en: 'Published by',
        },
      },
      pluginConfig.overrides?.auditGroupFieldOverrides.publishedByOverrides || {},
    )
    const publishedAt: DateField = deepMerge<DateField, AuditGroupFieldPublishedAtOverrides>(
      {
        name: 'publishedAt',
        type: 'date',
        access: {
          create: () => false,
          read: hasAdminFieldLevelAccess,
          update: () => false,
        },
        label: {
          de: 'Veröffentlicht am',
          en: 'Published at',
        },
      },
      pluginConfig.overrides?.auditGroupFieldOverrides.publishedAtOverrides || {},
    )
    publishedFields.push(publishedBy, publishedAt)
  }

  const createdAt: DateField = deepMerge<DateField, AuditGroupFieldUpdatedAtOverrides>(
    {
      name: 'createdAt',
      type: 'date',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        date: {
          displayFormat: 'yyyy.MM.dd HH:mm:ss',
          pickerAppearance: 'dayAndTime',
        },
        description: {
          de: 'Server-Zeitstempel der Erstellung. Dieser Wert wird automatisch erstellt und kann nicht geändert werden.',
          en: 'Server timestamp of creation. This value is automatically created and cannot be changed.',
        },
      },
      index: true,
      label: {
        de: 'Erstellt am',
        en: 'Created at',
      },
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.createdAtOverrides || {},
  )

  const createdBy: TextField = deepMerge<TextField, AuditGroupFieldUpdatedByOverrides>(
    {
      name: 'createdBy',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      label: {
        de: 'Erstellt von',
        en: 'Created by',
      },
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.createdByOverrides || {},
  )

  const updatedAt: DateField = deepMerge<DateField, AuditGroupFieldUpdatedAtOverrides>(
    {
      name: 'updatedAt',
      type: 'date',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        date: {
          displayFormat: 'yyyy.MM.dd HH:mm:ss',
          pickerAppearance: 'dayAndTime',
        },
        description: {
          de: 'Server-Zeitstempel der letzten Aktualisierung. Dieser Wert wird automatisch erstellt und kann nicht geändert werden.',
          en: 'Server timestamp of the latest update. This value is automatically created and cannot be changed.',
        },
      },
      label: {
        de: 'Gebracht am',
        en: 'Updated at',
      },
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.updatedAtOverrides || {},
  )

  const updatedBy: TextField = deepMerge<TextField, AuditGroupFieldUpdatedByOverrides>(
    {
      name: 'updatedBy',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      label: {
        de: 'Gebracht von',
        en: 'Updated by',
      },
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.updatedByOverrides || {},
  )

  const auditGroup: GroupField = deepMerge<GroupField, AuditGroupFieldOverrides['groupOverrides']>(
    {
      name: 'audit',
      type: 'group',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      fields: [createdAt, createdBy, updatedAt, updatedBy, ...publishedFields],
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.groupOverrides || {},
  )

  const collapsible: CollapsibleField = deepMerge<
    CollapsibleField,
    AuditGroupFieldOverrides['collapsibleOverrides']
  >(
    {
      type: 'collapsible',
      admin: {
        initCollapsed: true,
      },
      fields: [auditGroup],
      label: 'Audit',
    },
    pluginConfig.overrides?.auditGroupFieldOverrides.collapsibleOverrides || {},
  )

  fields.push(collapsible)

  return fields
}

export const enqueueAuditLog = async ({
  slug,
  type,
  action,
  context,
  docId,
  req,
  userId,
}: {
  action: AuditActionType
  context: unknown
  docId: string
  req: PayloadRequest
  slug: string
  type: AuditType
  userId: string
}) => {
  await req.payload.jobs.queue({
    input: {
      slug,
      type,
      action,
      context,
      docId,
      userId,
    },
    queue: 'audit',
    task: 'createAuditLog',
  })
}

export function getRelationId(value: any) {
  if (value == null) {
    return value
  }

  // relationship with "hasMany: true"
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? v.id : v))
  }

  // single relationship object
  if (typeof value === 'object') {
    return value.id
  }

  // already an id
  return value
}

export function computeAuditDiff(before: any, after: any, fields: any[]) {
  const fieldMeta = extractFieldMetadata(fields)

  function walk(b: any, a: any, path: string[] = []): { after: any; before: any } {
    // ignore null primitives
    if (!isObject(b) && !isObject(a)) {
      if (b !== a) {
        return { after: a, before: b }
      }
      return { after: {}, before: {} }
    }

    const outBefore: any = {}
    const outAfter: any = {}

    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})])

    for (const key of keys) {
      const fullPath = [...path, key].join('.')

      // -------- IGNORE LOGIC --------
      if (GLOBAL_IGNORE_KEYS.includes(key) || fieldMeta.ignore.has(fullPath)) {
        continue
      }

      const beforeVal = b?.[key]
      const afterVal = a?.[key]

      // -------- REDACTION LOGIC --------
      if (GLOBAL_REDACT_KEYS.includes(key) || fieldMeta.redact.has(fullPath)) {
        outBefore[key] = 'REDACTED'
        outAfter[key] = 'REDACTED'
        continue
      }

      // Relationship → ID redaction
      if (fieldMeta.relationship.has(fullPath)) {
        const beforeId = getRelationId(beforeVal)
        const afterId = getRelationId(afterVal)

        if (beforeId !== afterId) {
          outBefore[key] = beforeId
          outAfter[key] = afterId
        }
        continue
      }

      // -------- NESTED WALK --------
      if (isObject(beforeVal) || isObject(afterVal)) {
        const nested = walk(beforeVal, afterVal, [...path, key])
        if (Object.keys(nested.before).length || Object.keys(nested.after).length) {
          outBefore[key] = nested.before
          outAfter[key] = nested.after
        }
        continue
      }

      // -------- PRIMITIVES --------
      if (beforeVal !== afterVal) {
        outBefore[key] = beforeVal
        outAfter[key] = afterVal
      }
    }

    return { after: outAfter, before: outBefore }
  }

  return walk(before, after)
}

export function extractFieldMetadata(fields: any[]) {
  const redact = new Set<string>()
  const ignore = new Set<string>()
  const relationship = new Set<string>()

  function walk(flds: any[], parentPath = '') {
    for (const f of flds) {
      if (!('name' in f)) {
        continue
      }

      const path = parentPath ? `${parentPath}.${f.name}` : f.name
      const audit = f.custom?.flexiweb?.audit

      if (audit?.isRedacted) {
        redact.add(audit.path || path)
      }
      if (audit?.ignore) {
        ignore.add(audit.path || path)
      } // <-- use audit.path if defined
      if (f.type === 'relationship') {
        relationship.add(audit?.path || path)
      }

      if (f.type === 'group') {
        walk(f.fields, path)
      }
    }
  }

  walk(fields)

  return { ignore, redact, relationship }
}

export function isObject(value: any) {
  return value && typeof value === 'object' && !Array.isArray(value)
}
