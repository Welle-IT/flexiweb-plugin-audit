import { isModuleEnabled } from '@flexiweb/core/utils'
import { type CollectionConfig, type Config, deepMerge, type Field } from 'payload'

import type {
  AuditPluginConfig,
  FlexiwebAuditRegistry,
  IncomingCollectionVersions,
} from './types.js'

import { getAuditLogs } from './collections/audits/config.js'
import { AUDIT_LOGS_SLUG, DEFAULT_USERNAME_FIELD } from './constants.js'
import {
  createAuditLogsAfterCollectionChange,
  createAuditLogsAfterCollectionDelete,
  createAuditLogsAfterGlobalChange,
} from './hooks/createAuditLogs.js'
import { setAuditData } from './hooks/setAuditData.js'
import { createAuditLogTask } from './tasks/createAuditLogs.js'
import { processAuditGroupFields } from './utils.js'

/**
 * Plugin entry point.
 *
 * This plugin adds a pre-configured Audit Logs collection, and adds audit fields to collections, provides the possibility to full-Audit using dedicated collection.
 * @returns A PayloadCMS plugin function that modifies the config
 */
export const flexiwebAuditPlugin =
  (pluginOptions: AuditPluginConfig) =>
  (config: Config): Config => {
    if (!isModuleEnabled(config, 'core')) {
      throw new Error('@flexiweb/core is required to use @flexiweb/audit')
    }

    const auditRegistry: FlexiwebAuditRegistry = {
      enabled: true,
      flags: [],
      options: {},
    }

    config.custom = config.custom || {}
    config.custom.flexiweb = {
      ...config.custom.flexiweb,
      audit: auditRegistry,
    }

    config.collections = config.collections || []
    const auditLogs = deepMerge<CollectionConfig>(
      getAuditLogs(pluginOptions),
      pluginOptions.overrides?.audits?.overrides || {},
    )
    config.collections.push(auditLogs)
    const exludedCollections = pluginOptions.excludedCollections || []
    exludedCollections.push(AUDIT_LOGS_SLUG)

    config.collections
      .filter((x) => !exludedCollections.includes(x.slug))
      .forEach((collection) => {
        collection.admin = collection.admin ?? {}

        const fields: Field[] = collection.fields ?? []
        collection.fields = processAuditGroupFields(
          fields,
          pluginOptions,
          (collection?.versions as IncomingCollectionVersions)?.drafts as boolean,
        )

        collection.hooks = {
          ...collection.hooks,
          beforeChange: [
            ...((collection.hooks && collection.hooks.beforeChange) || []),
            setAuditData(pluginOptions.usernameField || DEFAULT_USERNAME_FIELD),
          ],
        }

        // Add hooks to collections if fullAudits is not disabled
        if (!pluginOptions.fullAudits.disabled) {
          const exludedCollections = pluginOptions.fullAudits.excludedCollections || []
          if (!exludedCollections.includes(collection.slug)) {
            collection.hooks = {
              ...collection.hooks,
              afterChange: [
                ...((collection.hooks && collection.hooks.afterChange) || []),
                createAuditLogsAfterCollectionChange,
              ],
              afterDelete: [
                ...((collection.hooks && collection.hooks.afterDelete) || []),
                createAuditLogsAfterCollectionDelete,
              ],
            }
          }
        }
      })

    config.globals = config.globals ?? []

    config.globals
      .filter((x) => !pluginOptions.excludedGlobals?.includes(x.slug))
      .forEach((global) => {
        const fields: Field[] = global.fields ?? []
        global.fields = processAuditGroupFields(
          fields,
          pluginOptions,
          (global?.versions as IncomingCollectionVersions)?.drafts as boolean,
        )

        global.hooks = {
          ...global.hooks,
          beforeChange: [
            ...((global.hooks && global.hooks.beforeChange) || []),
            setAuditData(pluginOptions.usernameField || DEFAULT_USERNAME_FIELD, true),
          ],
        }

        // Add hooks to globals if fullAudits is not disabled
        if (!pluginOptions.fullAudits.disabled) {
          const exludedGlobals = pluginOptions.fullAudits.excludedGlobals || []
          if (!exludedGlobals.includes(global.slug)) {
            global.hooks = {
              ...global.hooks,
              afterChange: [
                ...((global.hooks && global.hooks.afterChange) || []),
                createAuditLogsAfterGlobalChange,
              ],
            }
          }
        }
      })

    if (!pluginOptions.fullAudits.disabled) {
      config.jobs = config.jobs || {}
      config.jobs.tasks = config.jobs.tasks || []
      config.jobs.tasks = [...config.jobs.tasks, createAuditLogTask]
    }

    return config
  }
