/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PayloadRequest } from 'payload'

import {
  AUDIT_GROUP_NAME,
  CREATED_AT_FIELD_NAME,
  CREATED_BY_FIELD_NAME,
  DEFAULT_ID,
  DEFAULT_USERNAME,
  PUBLISHED_AT_FIELD_NAME,
  PUBLISHED_BY_FIELD_NAME,
  UPDATED_AT_FIELD_NAME,
  UPDATED_BY_FIELD_NAME,
} from '../constants.js'

interface DataWithAudit {
  [key: string]: any
}

export const setAuditData = (usernameField: string, noOp: boolean = false) => {
  return (args: {
    data: DataWithAudit
    operation?: 'create' | 'update'
    originalDoc?: any
    req: PayloadRequest
  }) => {
    // Globals often have no operation passed → default to update
    const operation = (args.operation ??= 'update')

    // Resolve user info
    const userName = args.req?.user?.[usernameField] || DEFAULT_USERNAME
    const userId = args.req?.user?.id?.toString?.() || DEFAULT_ID

    // Ensure audit object exists
    const audit = (args.data[AUDIT_GROUP_NAME] ??= {})

    // --- UPDATE AUDIT FIELDS ---

    if (operation === 'update') {
      audit[UPDATED_BY_FIELD_NAME] = `${userName} (${userId})`
      audit[UPDATED_AT_FIELD_NAME] = new Date().toISOString()
    }

    if (operation === 'create') {
      audit[CREATED_BY_FIELD_NAME] = `${userName} (${userId})`
      audit[CREATED_AT_FIELD_NAME] = new Date().toISOString()
    }

    // --- PUBLISHING LOGIC ---

    if (args.req.user) {
      if (operation === 'create' && args.data._status === 'published') {
        audit[PUBLISHED_AT_FIELD_NAME] = new Date().toISOString()
        audit[PUBLISHED_BY_FIELD_NAME] = `${userName} (${userId})`
      }

      if (
        operation === 'update' &&
        args.originalDoc?._status === 'draft' &&
        args.data._status === 'published'
      ) {
        audit[PUBLISHED_AT_FIELD_NAME] = new Date().toISOString()
        audit[PUBLISHED_BY_FIELD_NAME] = `${userName} (${userId})`
      }
    }

    // Remove operation if required
    if (noOp) {
      delete args.operation
    }

    return args.data
  }
}
