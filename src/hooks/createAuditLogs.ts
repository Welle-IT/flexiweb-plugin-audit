import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  TypedUser,
} from 'payload'

import { AuditActionType, AuditType } from '../types.js'
import { computeAuditDiff, enqueueAuditLog } from '../utils.js'

export const createAuditLogsAfterCollectionChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  let user: null | TypedUser = null
  if (req.user) {
    user = {
      id: req.user.id,
      collection: req.user.collection || '-',
      email: req.user.email,
      isSystem: req.user.isSystem || false,
      role: req.user.role || '-',
    }
  }

  const { after, before } = computeAuditDiff(previousDoc, doc, collection.fields)

  await enqueueAuditLog({
    slug: collection.slug,
    type: AuditType.COLLECTION,
    action: operation === 'create' ? AuditActionType.CREATE : AuditActionType.UPDATE,
    // eslint-disable-next-line perfectionist/sort-objects
    context: operation === 'create' ? { data: { after }, user } : { data: { before, after }, user },
    docId: doc?.id?.toString() || '-',
    req,
    userId: user?.id.toString() || '-',
  })

  return doc
}

export const createAuditLogsAfterCollectionDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  let user: null | TypedUser = null
  if (req.user) {
    user = {
      id: req.user.id,
      collection: req.user.collection || '-',
      email: req.user.email,
      isSystem: req.user.isSystem || false,
      role: req.user.role || '-',
    }
  }

  const { before } = computeAuditDiff(doc, null, collection.fields)

  await enqueueAuditLog({
    slug: collection.slug,
    type: AuditType.COLLECTION,
    action: AuditActionType.DELETE,
    context: { data: { before }, user },
    docId: doc?.id?.toString() || '-',
    req,
    userId: user?.id.toString() || '-',
  })
  return doc
}

export const createAuditLogsAfterGlobalChange: GlobalAfterChangeHook = async ({
  doc,
  global,
  previousDoc,
  req,
}) => {
  let user: null | TypedUser = null
  if (req.user) {
    user = {
      id: req.user.id,
      collection: req.user.collection || '-',
      email: req.user.email,
      isSystem: req.user.isSystem || false,
      role: req.user.role || '-',
    }
  }

  const { after, before } = computeAuditDiff(previousDoc, doc, global.fields)

  await enqueueAuditLog({
    slug: global.slug,
    type: AuditType.GLOBAL,
    action: AuditActionType.UPDATE,
    // eslint-disable-next-line perfectionist/sort-objects
    context: { data: { before, after }, user },
    docId: doc?.id?.toString() || '-',
    req,
    userId: user?.id.toString() || '-',
  })
  return doc
}
