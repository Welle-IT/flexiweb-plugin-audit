import type { Payload } from 'payload'

import { adminUser, editorUser, systemUser, userUser } from './helpers/credentials.js'

export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: systemUser.email,
      },
    },
  })

  if (!totalDocs) {
    const sys = await payload.create({
      collection: 'users',
      data: systemUser,
    })
    await payload.update({
      id: sys.id,
      collection: 'users',
      data: {
        isSystem: true,
      },
    })
    const admin = await payload.create({
      collection: 'users',
      data: adminUser,
    })
    const editor = await payload.create({
      collection: 'users',
      data: editorUser,
    })
    const user = await payload.create({
      collection: 'users',
      data: userUser,
    })

    // create Foo for each
    await Promise.all(
      [sys, admin, editor, user].map((user) =>
        payload.create({ collection: 'foos', data: { user: user.id } }),
      ),
    )
  }
}
