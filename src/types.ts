import type { FlexiwebRegistryItem } from '@flexiweb/core/types'
import type {
  CollapsibleField,
  CollectionConfig,
  CollectionSlug,
  DateField,
  GlobalSlug,
  GroupField,
  JSONField,
  TextField,
} from 'payload'

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
    auditGroupFieldOverrides: AuditGroupFieldOverrides
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

export type AuditGroupFieldOverrides = {
  collapsibleOverrides?: Omit<CollapsibleField, 'type'>
  createdAtOverrides?: AuditGroupFieldCreatedAtOverrides
  createdByOverrides?: AuditGroupFieldCreatedByOverrides
  groupOverrides: Omit<GroupField, 'name' | 'type'>
  publishedAtOverrides?: AuditGroupFieldPublishedAtOverrides
  publishedByOverrides?: AuditGroupFieldPublishedByOverrides
  updatedAtOverrides?: AuditGroupFieldUpdatedAtOverrides
  updatedByOverrides?: AuditGroupFieldUpdatedByOverrides
}

export type AuditGroupFieldPublishedByOverrides = Omit<TextField, 'name' | 'type'>
export type AuditGroupFieldPublishedAtOverrides = Omit<DateField, 'name' | 'type'>
export type AuditGroupFieldCreatedByOverrides = Omit<TextField, 'name' | 'type'>
export type AuditGroupFieldCreatedAtOverrides = Omit<DateField, 'name' | 'type'>
export type AuditGroupFieldUpdatedByOverrides = Omit<TextField, 'name' | 'type'>
export type AuditGroupFieldUpdatedAtOverrides = Omit<DateField, 'name' | 'type'>

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
