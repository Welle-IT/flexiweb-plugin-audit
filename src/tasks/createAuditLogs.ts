import type { TaskConfig } from 'payload'

import fs from 'fs'

export const createAuditLogTask: TaskConfig<'createAuditLog'> = {
  slug: 'createAuditLog',
  label: 'Create Audit Log',
  retries: 2,

  inputSchema: [
    { name: 'userId', type: 'text', required: true },
    { name: 'type', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'action', type: 'text', required: true },
    { name: 'docId', type: 'text', required: true },
    { name: 'context', type: 'json', required: true },
  ],

  outputSchema: [{ name: 'auditId', type: 'text', required: true }],

  handler: async ({ input, req }) => {
    req.payload.logger.debug('[Flexiweb/audit] Creating audit logs')
    if (!input) {
      throw new Error('No input provided')
    }
    try {
      const result = await req.payload.create({
        collection: 'audit-logs',
        data: {
          slug: input.slug,
          type: input.type,
          action: input.action,
          context: input.context,
          docId: input.docId,
          userId: input.userId,
        },
        req,
      })

      return {
        output: { auditId: result.id },
      }
    } catch (error) {
      fs.appendFileSync('error.log', `Error while creating audit log: ${JSON.stringify(error)}\n`)
      throw error
    }
  },
}
