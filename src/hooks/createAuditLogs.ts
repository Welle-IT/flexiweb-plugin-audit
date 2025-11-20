import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  TypedUser,
} from 'payload'

import { AuditActionType, AuditType } from '../types.js'
import { enqueueAuditLog, filterChangedKeysKeepObjects } from '../utils.js'

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

  if (operation === 'create') {
    const { after } = filterChangedKeysKeepObjects(previousDoc, doc)
    await enqueueAuditLog({
      slug: collection.slug,
      type: AuditType.COLLECTION,
      action: AuditActionType.CREATE,
      context: { data: { after }, user },
      docId: doc?.id?.toString() || '-',
      req,
      userId: user?.id.toString() || '-',
    })
  } else {
    const { after, before } = filterChangedKeysKeepObjects(previousDoc, doc)
    await enqueueAuditLog({
      slug: collection.slug,
      type: AuditType.COLLECTION,
      action: AuditActionType.UPDATE,
      context: { data: { after, before }, user },
      docId: doc?.id?.toString() || '-',
      req,
      userId: user?.id.toString() || '-',
    })
  }

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

  const { before } = filterChangedKeysKeepObjects(doc, doc)
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
  const { after, before } = filterChangedKeysKeepObjects(previousDoc, doc)
  await enqueueAuditLog({
    slug: global.slug,
    type: AuditType.GLOBAL,
    action: AuditActionType.UPDATE,
    context: { data: { after, before }, user },
    docId: doc?.id?.toString() || '-',
    req,
    userId: user?.id.toString() || '-',
  })
  return doc
}
