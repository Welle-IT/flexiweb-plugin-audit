import type { Payload } from 'payload'
import type { User } from 'payload-types.js'

import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload
let systemUser: User
let adminUser: User
let editorUser: User
let userUser: User

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  const dbPath = path.join(__dirname, '../database.db')
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath) // remove the file
  }
  payload = await getPayload({ config })
  systemUser = (
    await payload.find({
      collection: 'users',
      where: {
        isSystem: {
          equals: true,
        },
      },
    })
  ).docs[0]
  adminUser = (
    await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'admin',
        },
      },
    })
  ).docs[0]
  editorUser = (
    await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'editor',
        },
      },
    })
  ).docs[0]
  userUser = (
    await payload.find({
      collection: 'users',
      where: {
        role: {
          equals: 'user',
        },
      },
    })
  ).docs[0]
})

describe('Plugin integration tests', () => {
  describe('Users collection', () => {
    describe('Read', () => {
      describe('System user', () => {
        test('Can read all users', async () => {
          const users = await payload.find({
            collection: 'users',
            overrideAccess: false,
            user: systemUser,
          })
          expect(users.docs.length).toBe(4)
        })
      })
      describe('Admin user', () => {
        test('Can read all users', async () => {
          const users = await payload.find({
            collection: 'users',
            overrideAccess: false,
            user: adminUser,
          })
          expect(users.docs.length).toBe(4)
        })
      })
      describe('Editor user', () => {
        test('Can read all users except system', async () => {
          const users = await payload.find({
            collection: 'users',
            overrideAccess: false,
            user: editorUser,
          })
          expect(users.docs.length).toBe(3)
        })
      })
      describe('User user', () => {
        test('Can read all users except system', async () => {
          const users = await payload.find({
            collection: 'users',
            overrideAccess: false,
            user: userUser,
          })
          expect(users.docs.length).toBe(3)
        })
      })
    })
    describe('Create', () => {
      describe('System user', () => {
        test('Cannot create system user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'ssystem@welle.com',
              isSystem: true,
              password: 'test',
              role: 'admin',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(user.isSystem).toBe(false)
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create admin user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'sadmin@welle.com',
              password: 'test',
              role: 'admin',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(user.email).toBe('sadmin@welle.com')
          expect(user.role).toBe('admin')
          expect(user.isSystem).toBe(false)
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create editor user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'seditor@welle.com',
              password: 'test',
              role: 'editor',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(user.email).toBe('seditor@welle.com')
          expect(user.role).toBe('editor')
          expect(user.isSystem).toBe(false)
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create user user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'suser@welle.com',
              password: 'test',
              role: 'user',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(user.email).toBe('suser@welle.com')
          expect(user.role).toBe('user')
          expect(user.isSystem).toBe(false)
          await payload.delete({ id: user.id, collection: 'users' })
        })
      })
      describe('Admin user', () => {
        test('Cannot create system user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'asystem@welle.com',
              isSystem: true,
              password: 'test',
              role: 'admin',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(user.isSystem).toBe(false)
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create admin user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'aadmin@welle.com',
              password: 'test',
              role: 'admin',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(user.isSystem).toBe(false)
          expect(user.role).toBe('admin')
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create editor user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'aeditor@welle.com',
              password: 'test',
              role: 'editor',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(user.isSystem).toBe(false)
          expect(user.role).toBe('editor')
          await payload.delete({ id: user.id, collection: 'users' })
        })
        test('Can create user user', async () => {
          const user = await payload.create({
            collection: 'users',
            data: {
              email: 'auser@welle.com',
              password: 'test',
              role: 'user',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(user.isSystem).toBe(false)
          expect(user.role).toBe('user')
          await payload.delete({ id: user.id, collection: 'users' })
        })
      })
      describe('Editor user', () => {
        test('Cannot create system user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'esystem@welle.com',
                isSystem: true,
                password: 'test',
                role: 'admin',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create admin user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'eadmin@welle.com',
                password: 'test',
                role: 'admin',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create editor user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'eeditor@welle.com',
                password: 'test',
                role: 'editor',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create user user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'euser@welle.com',
                password: 'test',
                role: 'user',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
      })
      describe('User user', () => {
        test('Cannot create system user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'usystem@welle.com',
                isSystem: true,
                password: 'test',
                role: 'admin',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create admin user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'uadmin@welle.com',
                password: 'test',
                role: 'admin',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create editor user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'ueditor@welle.com',
                password: 'test',
                role: 'editor',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot create user user', async () => {
          await expect(
            payload.create({
              collection: 'users',
              data: {
                email: 'uuser@welle.com',
                password: 'test',
                role: 'user',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
      })
    })
    describe('Update', () => {
      describe('System user', () => {
        test('Can update self', async () => {
          const updated = await payload.update({
            id: systemUser.id,
            collection: 'users',
            data: {
              test: 'A',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.test).toBe('A')
        })
        test('Cannot update system users role. System users role is immutable, and a user cannot update their own role', async () => {
          const update = await payload.update({
            id: systemUser.id,
            collection: 'users',
            data: {
              role: 'user',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(update.role, 'Should still be admin because system users role is immutable').toBe(
            'admin',
          )
        })
        test('Can update admin user', async () => {
          const updated = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              test: 'A',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.test).toBe('A')
        })
        test('Can grant User role', async () => {
          const updated = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              role: 'user',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.role).toBe('user')
        })
        test('Can grant Editor role', async () => {
          const updated = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              role: 'editor',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.role).toBe('editor')
        })
        test('Can grant Admin role', async () => {
          const updated = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              role: 'admin',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.role).toBe('admin')
        })
        test('Can update editor user', async () => {
          const updated = await payload.update({
            id: editorUser.id,
            collection: 'users',
            data: {
              test: 'A',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.test).toBe('A')
        })
        test('Can update user user', async () => {
          const updated = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              test: 'A',
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(updated.test).toBe('A')
        })
        test('Cannot grant isSystem', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'auser@welle.com',
              password: 'test',
              role: 'user',
            },
            overrideAccess: false,
            user: systemUser,
          })
          const update = await payload.update({
            id: newUser.id,
            collection: 'users',
            data: {
              isSystem: true,
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(update.isSystem).toBe(false)
          await payload.delete({ id: newUser.id, collection: 'users' })
        })
        test('Cannot revoke isSystem', async () => {
          // override access here is intentional
          const newSystem = await payload.create({
            collection: 'users',
            data: {
              email: 'asystem@welle.com',
              isSystem: true,
              password: 'test',
              role: 'admin',
            },
          })
          expect(newSystem.isSystem).toBe(true)
          const update = await payload.update({
            id: newSystem.id,
            collection: 'users',
            data: {
              isSystem: false,
            },
            overrideAccess: false,
            user: systemUser,
          })
          expect(update.isSystem).toBe(true)
          await payload.delete({ id: newSystem.id, collection: 'users' })
        })
      })
      describe('Admin user', () => {
        test('Can update self', async () => {
          const updated = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              test: 'B',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.test).toBe('B')
        })
        test('Cannot update own role', async () => {
          const update = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              role: 'user',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(update.role).toBe('admin')
        })
        test('Cannot update System user', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                test: 'B',
              },
              overrideAccess: false,
              user: adminUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot update System users role', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: adminUser,
            }),
          ).rejects.toThrow()
        })
        test('Can Update Admin user', async () => {
          const newAdmin = await payload.create({
            collection: 'users',
            data: {
              email: 'aadmin@welle.com',
              password: 'test',
              role: 'admin',
            },
          })
          const updated = await payload.update({
            id: newAdmin.id,
            collection: 'users',
            data: {
              test: 'B',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.test).toBe('B')
          await payload.delete({ id: newAdmin.id, collection: 'users' })
        })
        test('Can grant Admin role', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'auser@welle.com',
              password: 'test',
              role: 'user',
            },
          })
          const updated = await payload.update({
            id: newUser.id,
            collection: 'users',
            data: {
              role: 'admin',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.role).toBe('admin')
          await payload.delete({ id: newUser.id, collection: 'users' })
        })
        test('Can grant Editor role', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'auser@welle.com',
              password: 'test',
              role: 'user',
            },
          })
          const updated = await payload.update({
            id: newUser.id,
            collection: 'users',
            data: {
              role: 'editor',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.role).toBe('editor')
          await payload.delete({ id: newUser.id, collection: 'users' })
        })
        test('Can grant User role', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'aeditor@welle.com',
              password: 'test',
              role: 'editor',
            },
          })
          const updated = await payload.update({
            id: newUser.id,
            collection: 'users',
            data: {
              role: 'user',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.role).toBe('user')
          await payload.delete({ id: newUser.id, collection: 'users' })
        })
        test('Can update editor user', async () => {
          const updated = await payload.update({
            id: editorUser.id,
            collection: 'users',
            data: {
              test: 'B',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.test).toBe('B')
        })
        test('Can update user user', async () => {
          const updated = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              test: 'B',
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(updated.test).toBe('B')
        })
        test('Cannot grant isSystem', async () => {
          const update = await payload.update({
            id: adminUser.id,
            collection: 'users',
            data: {
              isSystem: true,
            },
            overrideAccess: false,
            user: adminUser,
          })
          expect(update.isSystem).toBe(false)
        })
        test('Cannot revoke isSystem', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                isSystem: false,
              },
              overrideAccess: false,
              user: adminUser,
            }),
          ).rejects.toThrow()
        })
      })
      describe('Editor user', () => {
        test('Can update self', async () => {
          const updated = await payload.update({
            id: editorUser.id,
            collection: 'users',
            data: {
              test: 'C',
            },
            overrideAccess: false,
            user: editorUser,
          })
          expect(updated.test).toBe('C')
        })
        test('Cannot update own role', async () => {
          const update = await payload.update({
            id: editorUser.id,
            collection: 'users',
            data: {
              role: 'user',
            },
            overrideAccess: false,
            user: editorUser,
          })
          expect(update.role, 'Should still be editor').toBe('editor')
        })
        test('Cannot update System user', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot update Admin user', async () => {
          await expect(
            payload.update({
              id: adminUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot update other Editor user', async () => {
          const newEditor = await payload.create({
            collection: 'users',
            data: {
              email: 'eeditor@welle.com',
              password: 'test',
              role: 'editor',
            },
          })
          await expect(
            payload.update({
              id: newEditor.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
          await payload.delete({ id: newEditor.id, collection: 'users' })
        })
        test('Can update User user', async () => {
          const updated = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              test: 'C',
            },
            overrideAccess: false,
            user: editorUser,
          })
          expect(updated.test).toBe('C')
        })
        test('Cannot udpate User users role', async () => {
          const update = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              role: 'editor',
            },
            overrideAccess: false,
            user: editorUser,
          })
          expect(update.role, 'Should still be user').toBe('user')
        })
        test('Cannot grant isSystem', async () => {
          const update = await payload.update({
            id: editorUser.id,
            collection: 'users',
            data: {
              isSystem: true,
            },
            overrideAccess: false,
            user: editorUser,
          })
          expect(update.isSystem).toBe(false)
        })
        test('Cannot revoke isSystem', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                isSystem: false,
              },
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
      })
      describe('User user', () => {
        test('Can update self', async () => {
          const updated = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              test: 'D',
            },
            overrideAccess: false,
            user: userUser,
          })
          expect(updated.test).toBe('D')
        })
        test('Cannot update own role', async () => {
          const update = await payload.update({
            id: userUser.id,
            collection: 'users',
            data: {
              role: 'admin',
            },
            overrideAccess: false,
            user: userUser,
          })
          expect(update.role, 'Should still be user').toBe('user')
        })
        test('Cannot update System user', async () => {
          await expect(
            payload.update({
              id: systemUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot update Admin user', async () => {
          await expect(
            payload.update({
              id: adminUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot update Editor user', async () => {
          await expect(
            payload.update({
              id: editorUser.id,
              collection: 'users',
              data: {
                role: 'user',
              },
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
      })
    })
    describe('Delete', () => {
      describe('System user', () => {
        test('Cannot delete self', async () => {
          await expect(
            payload.delete({
              id: systemUser.id,
              collection: 'users',
              overrideAccess: false,
              user: systemUser,
            }),
          ).rejects.toThrow()
        })
        test('Can delete Admin user', async () => {
          const newAdmin = await payload.create({
            collection: 'users',
            data: {
              email: 'aadmin@welle.com',
              password: 'test',
              role: 'admin',
            },
          })
          await payload.delete({
            id: newAdmin.id,
            collection: 'users',
            overrideAccess: false,
            user: systemUser,
          })
        })
        test('Can delete Editor user', async () => {
          const newEditor = await payload.create({
            collection: 'users',
            data: {
              email: 'eeditor@welle.com',
              password: 'test',
              role: 'editor',
            },
          })
          await payload.delete({
            id: newEditor.id,
            collection: 'users',
            overrideAccess: false,
            user: systemUser,
          })
        })
        test('Can delete User user', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'suser@welle.com',
              password: 'test',
              role: 'user',
            },
          })
          await payload.delete({
            id: newUser.id,
            collection: 'users',
            overrideAccess: false,
            user: systemUser,
          })
        })
      })
      describe('Admin user', () => {
        test('Cannot delete self', async () => {
          await expect(
            payload.delete({
              id: adminUser.id,
              collection: 'users',
              overrideAccess: false,
              user: adminUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete System user', async () => {
          await expect(
            payload.delete({
              id: systemUser.id,
              collection: 'users',
              overrideAccess: false,
              user: adminUser,
            }),
          ).rejects.toThrow()
        })
        test('Can delete other Admin user', async () => {
          const newAdmin = await payload.create({
            collection: 'users',
            data: {
              email: 'aadmin@welle.com',
              password: 'test',
              role: 'admin',
            },
          })
          await payload.delete({
            id: newAdmin.id,
            collection: 'users',
            overrideAccess: false,
            user: adminUser,
          })
        })
        test('Can delete Editor user', async () => {
          const newEditor = await payload.create({
            collection: 'users',
            data: {
              email: 'eeditor@welle.com',
              password: 'test',
              role: 'editor',
            },
          })
          await payload.delete({
            id: newEditor.id,
            collection: 'users',
            overrideAccess: false,
            user: adminUser,
          })
        })
        test('Can delete User user', async () => {
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: 'auser@welle.com',
              password: 'test',
              role: 'user',
            },
          })
          await payload.delete({
            id: newUser.id,
            collection: 'users',
            overrideAccess: false,
            user: adminUser,
          })
        })
      })
      describe('Editor user', () => {
        test('Cannot delete self', async () => {
          await expect(
            payload.delete({
              id: editorUser.id,
              collection: 'users',
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete System user', async () => {
          await expect(
            payload.delete({
              id: systemUser.id,
              collection: 'users',
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete Admin user', async () => {
          await expect(
            payload.delete({
              id: adminUser.id,
              collection: 'users',
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete Editor user', async () => {
          await expect(
            payload.delete({
              id: editorUser.id,
              collection: 'users',
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete User user', async () => {
          await expect(
            payload.delete({
              id: userUser.id,
              collection: 'users',
              overrideAccess: false,
              user: editorUser,
            }),
          ).rejects.toThrow()
        })
      })
      describe('User user', () => {
        test('Cannot delete self', async () => {
          await expect(
            payload.delete({
              id: userUser.id,
              collection: 'users',
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete System user', async () => {
          await expect(
            payload.delete({
              id: systemUser.id,
              collection: 'users',
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete Admin user', async () => {
          await expect(
            payload.delete({
              id: adminUser.id,
              collection: 'users',
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete Editor user', async () => {
          await expect(
            payload.delete({
              id: editorUser.id,
              collection: 'users',
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
        test('Cannot delete User user', async () => {
          await expect(
            payload.delete({
              id: userUser.id,
              collection: 'users',
              overrideAccess: false,
              user: userUser,
            }),
          ).rejects.toThrow()
        })
      })
    })
  })

  describe('Foos Collection (Validations)', () => {
    describe('Read (userLinkedAccess)', () => {
      test('System user can read all foos', async () => {
        const foos = await payload.find({
          collection: 'foos',
          overrideAccess: false,
          user: systemUser,
        })
        expect(foos.docs.length).toBe(4)
      })
      test('Admin user can read all foos', async () => {
        const foos = await payload.find({
          collection: 'foos',
          overrideAccess: false,
          user: adminUser,
        })
        expect(foos.docs.length).toBe(4)
      })
      test('Editor user can read all foos', async () => {
        const foos = await payload.find({
          collection: 'foos',
          overrideAccess: false,
          user: editorUser,
        })
        expect(foos.docs.length).toBe(4)
      })
      test('User user can only his own foos', async () => {
        const foos = await payload.find({
          collection: 'foos',
          overrideAccess: false,
          user: userUser,
        })
        expect(foos.docs.length).toBe(1)
      })
    })
  })
})
