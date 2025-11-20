import type { CollectionConfig } from 'payload'

import type { AuditPluginConfig } from '../../types.js'

import {
  createAuditAccess,
  deleteAuditAccess,
  readAuditAccess,
  updateAuditAccess,
} from './access.js'
import { getAuditLogFields } from './fields.js'

export const getAuditLogs = (pluginOptions: AuditPluginConfig): CollectionConfig => {
  return {
    slug: 'audit-logs',
    access: {
      create: createAuditAccess,
      delete: deleteAuditAccess,
      read: readAuditAccess,
      update: updateAuditAccess,
    },
    admin: {
      defaultColumns: ['id', 'action', 'type', 'slug', 'docId', 'context', 'createdAt'],
      group: {
        de: 'Sicherheit',
        en: 'Security',
      },
      hidden: (_args) => {
        return pluginOptions.fullAudits.disabled
      },
    },
    fields: [...getAuditLogFields(pluginOptions)],
    labels: {
      plural: {
        de: 'Audit-Logs',
        en: 'Audit-Logs',
      },
      singular: {
        de: 'Audit-Log',
        en: 'Audit-Log',
      },
    },
    timestamps: true,
  }
}
