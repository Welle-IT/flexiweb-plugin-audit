/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Field, PayloadRequest } from 'payload'

import { hasAdminFieldLevelAccess } from '@flexiweb/core/access'

import type { AuditActionType, AuditType } from './types.js'

import { GLOBAL_IGNORE_KEYS, GLOBAL_REDACT_KEYS, REDACTED } from './constants.js'

export function diffObjects(
  beforeObj: any,
  afterObj: any,
  options: {
    ignoreKeys: string[]
    redactKeys: string[]
  },
) {
  const { ignoreKeys, redactKeys } = options
  const before: any = {}
  const after: any = {}

  const keys = new Set([...Object.keys(afterObj || {}), ...Object.keys(beforeObj || {})])

  for (const key of keys) {
    const beforeVal = beforeObj?.[key]
    const afterVal = afterObj?.[key]

    if (ignoreKeys.includes(key)) {
      continue
    }

    const changed = JSON.stringify(beforeVal) !== JSON.stringify(afterVal)

    if (!changed) {
      continue
    }

    // redaction (global OR custom provided from hook)
    if (redactKeys.includes(key)) {
      before[key] = REDACTED
      after[key] = REDACTED
      continue
    }

    // nested object diff
    if (
      beforeVal &&
      afterVal &&
      typeof beforeVal === 'object' &&
      typeof afterVal === 'object' &&
      !Array.isArray(beforeVal) &&
      !Array.isArray(afterVal)
    ) {
      const nested = diffObjects(beforeVal, afterVal, options)
      if (Object.keys(nested.before).length || Object.keys(nested.after).length) {
        before[key] = nested.before
        after[key] = nested.after
      }
      continue
    }

    // store raw changed values
    before[key] = beforeVal
    after[key] = afterVal
  }

  return { after, before }
}

export function filterChangedKeysKeepObjects(
  beforeObj: any,
  afterObj: any,
  opts?: {
    ignoreKeys?: string[]
    redactKeys?: string[]
  },
) {
  return diffObjects(beforeObj, afterObj, {
    ignoreKeys: [
      ...GLOBAL_IGNORE_KEYS,
      ...(opts?.ignoreKeys || []), // collection-specific ignores
    ],
    redactKeys: [
      ...GLOBAL_REDACT_KEYS,
      ...(opts?.redactKeys || []), // collection-specific redactions
    ],
  })
}

export function redactKeys<T extends Record<string, any>>(obj: T, keysToRedact: string[] = []): T {
  if (obj === null || typeof obj !== 'object') {
    return obj as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactKeys(item, keysToRedact)) as any
  }

  const combinedKeys = new Set([...GLOBAL_REDACT_KEYS, ...keysToRedact])
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (combinedKeys.has(key)) {
      result[key] = REDACTED
    } else if (value && typeof value === 'object') {
      result[key] = redactKeys(value, keysToRedact)
    } else {
      result[key] = value
    }
  }

  return result as T
}

export function processAuditGroupFields(fields: Field[], hasDrafts: boolean) {
  const publishedFields: Field[] = []
  if (hasDrafts) {
    publishedFields.push(
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
    )
  }

  fields.push({
    type: 'collapsible',
    admin: {
      initCollapsed: true,
    },
    fields: [
      {
        name: 'audit',
        type: 'group',
        access: {
          create: () => false,
          read: hasAdminFieldLevelAccess,
          update: () => false,
        },
        fields: [
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
          ...publishedFields,
        ],
      },
    ],
    label: 'Audit',
  })

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
