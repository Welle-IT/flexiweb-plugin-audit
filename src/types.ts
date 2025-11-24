import type { FlexiwebRegistryItem } from '@flexiweb/core/types'
import type { CollectionConfig, CollectionSlug, GlobalSlug, JSONField, TextField } from 'payload'

/**
 * Configuration options for the @flexiweb/audit plugin.
 */
export type AuditPluginConfig = {
  excludedCollections?: CollectionSlug[]
  excludedGlobals?: string[]
  fullAudits: {
    disabled: boolean
    excludedCollections: CollectionSlug[]
    excludedGlobals: GlobalSlug[]
  }
  overrides?: {
    audits?: {
      fieldOverrides?: AuditFieldOverrides
      overrides?: Omit<CollectionConfig, 'fields' | 'slug'>
    }
  }
  usernameField?: string
}

export type IncomingCollectionVersions = {
  drafts?: boolean
  maxPerDoc?: number
}

export type AuditFieldTypeOverrides = Omit<TextField, 'access' | 'name' | 'required' | 'type'>
export type AuditFieldLabelOverrides = Omit<TextField, 'access' | 'name' | 'required' | 'type'>
export type AuditFieldActionOverrides = Omit<TextField, 'access' | 'name' | 'required' | 'type'>
export type AuditFieldDocIdOverrides = Omit<TextField, 'access' | 'name' | 'required' | 'type'>
export type AuditFieldUserIdOverrides = Omit<TextField, 'access' | 'name' | 'required' | 'type'>
export type AuditFieldDataOverrides = Omit<JSONField, 'name' | 'required' | 'type'>

export type AuditFieldOverrides = {
  actionOverrides?: AuditFieldActionOverrides
  dataOverrides?: AuditFieldDataOverrides
  docIdOverrides?: AuditFieldDocIdOverrides
  labelOverrides?: AuditFieldLabelOverrides
  typeOverrides?: AuditFieldTypeOverrides
  userIdOverrides?: AuditFieldUserIdOverrides
}

export enum AuditType {
  COLLECTION = 'collection',
  GLOBAL = 'global',
}

export enum AuditActionType {
  CREATE = 'create',
  DELETE = 'delete',
  READ = 'read',
  UPDATE = 'update',
}

export type FlexiwebAuditRegistry = FlexiwebRegistryItem
