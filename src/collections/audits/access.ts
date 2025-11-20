import type { Access } from 'payload'

import { hasAdminAccess } from '@flexiweb/core/access'

/**
 * Access control for creating audit records.
 *
 * Only the system can create audit records, not even users with System permissions
 *
 * @param ctx - The access control context
 * @returns false
 */
export const createAuditAccess: Access = (_ctx) => false

/**
 * Access control for reading audit records.
 *
 * System and Admin users can read audit records
 *
 * @param ctx - The access control context
 * @returns True or false
 */
export const readAuditAccess: Access = (ctx) => hasAdminAccess(ctx)

/**
 * Access control for updating audit records.
 *
 * Only the system can update audit records, not even users with System permissions
 *
 * @param ctx - The access control context
 * @returns False
 */
export const updateAuditAccess: Access = (_ctx) => false

/**
 * Access control for deleting audit records.
 *
 * Only the system can delete audit records, not even users with System permissions
 *
 * @param ctx - The access control context
 * @returns False
 */
export const deleteAuditAccess: Access = (_ctx) => false
