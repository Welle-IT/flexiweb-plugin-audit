import { flexiwebAuditPlugin } from '@flexiweb/audit'
import { flexiwebCorePlugin } from '@flexiweb/core'
import { hasAdminAccess, userLinkedAccess } from '@flexiweb/core/access'
import { relationLinkedUser } from '@flexiweb/core/validations'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { de } from 'payload/i18n/de'
import { en } from 'payload/i18n/en'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { DEFAULT_QUEUE_AUTORUN_CONFIG } from '../src/constants.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

export default buildConfig({
  admin: {
    autoLogin: process.env.AUTO_LOGIN_EMAIL
      ? { email: process.env.AUTO_LOGIN_EMAIL, password: process.env.AUTO_LOGIN_PASSWORD }
      : undefined,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'foos',
      access: {
        delete: hasAdminAccess,
        read: userLinkedAccess,
        update: userLinkedAccess,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          // required: true,
          custom: {
            flexiweb: {
              audit: {
                isRedacted: true,
                path: 'user',
              },
            },
          },
          validate: relationLinkedUser(),
        },
        {
          name: 'secret',
          type: 'text',
        },
        {
          name: 'redactedGroup',
          type: 'group',
          custom: {
            flexiweb: {
              audit: {
                isRedacted: true,
                path: 'redactedGroup',
              },
            },
          },
          fields: [
            { name: 'g1', type: 'text' },
            { name: 'g2', type: 'text' },
          ],
        },
        {
          name: 'partlyRedactedGroup',
          type: 'group',
          fields: [
            {
              name: 'g1',
              type: 'text',
              custom: {
                flexiweb: {
                  audit: {
                    isRedacted: true,
                    path: 'partlyRedactedGroup.g1',
                  },
                },
              },
            },
            {
              name: 'g2',
              type: 'text',
              custom: {
                flexiweb: {
                  audit: {
                    ignore: true,
                    path: 'partlyRedactedGroup.g2',
                  },
                },
              },
            },
            {
              name: 'g3',
              type: 'relationship',
              hasMany: true,
              relationTo: 'users',
            },
          ],
        },
      ],
    },
  ],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
    },
    idType: 'uuid',
  }),
  editor: lexicalEditor(),
  globals: [
    {
      slug: 'foo',
      fields: [
        {
          name: 'bar',
          type: 'text',
        },
        {
          name: 'baz',
          type: 'text',
        },
      ],
    },
  ],
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: {
      de,
      en,
    },
  },
  jobs: {
    autoRun: [DEFAULT_QUEUE_AUTORUN_CONFIG],
  },

  onInit: async (payload) => {
    await seed(payload)
  },
  plugins: [
    flexiwebCorePlugin({
      overrides: {
        users: {
          additionalFields: [],
        },
      },
    }),
    flexiwebAuditPlugin({
      fullAudits: { disabled: false, excludedCollections: ['users'], excludedGlobals: ['foo'] },
      usernameField: 'email',
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
