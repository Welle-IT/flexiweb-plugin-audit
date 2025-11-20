import { hasAdminFieldLevelAccess } from '@flexiweb/core/access'
import { deepMerge, type Field, type JSONField, type TextField } from 'payload'

import type {
  AuditFieldActionOverrides,
  AuditFieldDataOverrides,
  AuditFieldDocIdOverrides,
  AuditFieldLabelOverrides,
  AuditFieldTypeOverrides,
  AuditFieldUserIdOverrides,
  AuditPluginConfig,
} from '../../types.js'

export const getAuditLogFields = (pluginConfig: AuditPluginConfig): Field[] => {
  const userIdField: TextField = deepMerge<TextField, AuditFieldUserIdOverrides>(
    {
      name: 'userId',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Benutzer ID',
        en: 'User ID',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.userIdOverrides || {},
  )

  const typeField: TextField = deepMerge<TextField, AuditFieldTypeOverrides>(
    {
      name: 'type',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Typ',
        en: 'Type',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.typeOverrides || {},
  )

  const slugField: TextField = deepMerge<TextField, AuditFieldLabelOverrides>(
    {
      name: 'slug',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Slug',
        en: 'Slug',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.labelOverrides || {},
  )

  const actionField: TextField = deepMerge<TextField, AuditFieldActionOverrides>(
    {
      name: 'action',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Aktion',
        en: 'Action',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.actionOverrides || {},
  )

  const docIdField: TextField = deepMerge<TextField, AuditFieldDocIdOverrides>(
    {
      name: 'docId',
      type: 'text',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Dokument ID',
        en: 'Document ID',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.docIdOverrides || {},
  )

  const contextField: JSONField = deepMerge<JSONField, AuditFieldDataOverrides>(
    {
      name: 'context',
      type: 'json',
      access: {
        create: () => false,
        read: hasAdminFieldLevelAccess,
        update: () => false,
      },
      admin: {
        readOnly: true,
      },
      label: {
        de: 'Kontext',
        en: 'Context',
      },
      required: true,
    },
    pluginConfig.overrides?.audits?.fieldOverrides?.dataOverrides || {},
  )

  return [userIdField, typeField, slugField, actionField, docIdField, contextField]
}
