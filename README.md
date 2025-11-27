# @flexiweb/audit

<div align="center">

**A comprehensive audit plugin for PayloadCMS v3 that automatically tracks changes to collections and globals, providing detailed audit logs and built-in audit fields for the Flexiweb ecosystem.**

<br />

[![License](https://img.shields.io/badge/license-Custom-blue.svg)](LICENSE.md)
[![Documentation](https://img.shields.io/badge/docs-Available-green.svg)](https://flexiweb.dev)
[![Website](https://img.shields.io/badge/website-flexiweb.dev-orange.svg)](https://flexiweb.dev)

**Quick Links:** [License](#license) • [Documentation](https://flexiweb.dev/docs) • [Website](https://flexiweb.dev)

</div>

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
- [Components](#components)
  - [Audit Fields](#audit-fields)
  - [Audit Logs Collection](#audit-logs-collection)
  - [Automatic Change Tracking](#automatic-change-tracking)
  - [Security Features](#security-features)
  - [Configuration](#configuration)
- [Overrides & Customization](#overrides--customization)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

`@flexiweb/audit` is a powerful, production-ready audit plugin for **PayloadCMS v3** that automatically tracks changes to collections and globals, providing comprehensive audit trails for your application. Built with security and compliance in mind, this plugin ensures you always know who changed what and when.

The plugin automatically adds audit fields to all collections and globals, tracks changes through hooks, and optionally creates detailed audit logs in a dedicated collection. Sensitive data is automatically redacted, and the system is designed to be fully configurable while maintaining security best practices.

### Key Principles

- **🔍 Automatic Tracking**: Automatically tracks all create, update, and delete operations
- **🛡️ Security First**: Sensitive fields are automatically redacted (passwords, tokens, etc.)
- **📊 Detailed Logs**: Optional full audit logs with before/after data and user context
- **🌍 i18n Ready**: Built-in support for multiple languages (German, English)
- **🛡️ Type Safe**: Full TypeScript support with comprehensive type definitions
- **⚙️ Configurable**: Exclude collections/globals, disable features, customize fields
- **🚀 Performance**: Asynchronous audit log processing via background jobs

---

## Features

### 📝 Automatic Audit Fields

Automatically adds audit fields to all collections and globals:

- **Created By/At**: Tracks who created the document and when
- **Updated By/At**: Tracks who last updated the document and when
- **Published By/At**: Tracks who published the document and when (for draft-enabled collections)
- Fields are read-only and only visible to admin users
- Organized in a collapsible "Audit" group for clean UI

### 📋 Audit Logs Collection

A dedicated `audit-logs` collection for comprehensive change tracking:

- **Full Change History**: Tracks create, update, and delete operations
- **Before/After Data**: Captures what changed with before and after values
- **User Context**: Records who made the change with user details
- **Collection & Global Support**: Tracks both collection documents and global settings
- **Background Processing**: Uses PayloadCMS jobs for asynchronous processing
- **Admin Only Access**: Only admin users can view audit logs

### 🔄 Automatic Change Tracking

Hooks automatically track all changes:

- **Collection Hooks**: Tracks create, update, and delete operations
- **Global Hooks**: Tracks changes to global settings
- **Asynchronous Processing**: Audit logs are queued and processed in the background
- **Configurable**: Can be disabled or excluded for specific collections/globals

### 🔒 Security Features

Built-in security and privacy protection:

- **Automatic Redaction**: Sensitive fields (passwords, tokens, API keys, etc.) are automatically redacted
- **Field-Level Control**: Configure individual fields to be redacted or ignored using custom field properties
- **Field Filtering**: Certain fields (like login timestamps) are excluded from audit logs
- **Group Support**: Redact or ignore entire groups or specific fields within groups
- **Read-Only Fields**: Audit fields cannot be modified by users
- **Access Control**: Only admin users can view audit information

### ⚙️ Configuration Options

Highly configurable to fit your needs:

- **Exclude Collections/Globals**: Skip audit fields for specific collections or globals
- **Disable Full Audits**: Use only audit fields without detailed logs
- **Custom Username Field**: Configure which user field to use for tracking
- **Field Overrides**: Customize audit log collection fields
- **Collection Overrides**: Customize the audit logs collection configuration

---

## Getting Started

### Installation

Install the package using your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm add @flexiweb/audit

# Using npm
npm install @flexiweb/audit

# Using yarn
yarn add @flexiweb/audit
```

### Peer Dependencies

This plugin requires the following peer dependencies:

- `payload@3.65.0`
- `@flexiweb/core@3.65.0`

### Basic Usage

#### 1. Add the Plugin to Your Payload Config

```typescript
import { flexiwebAuditPlugin } from '@flexiweb/audit'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    flexiwebAuditPlugin({
      // Optional: Configure plugin options
      excludedCollections: ['some-collection'], // Skip audit fields for specific collections
      excludedGlobals: ['some-global'], // Skip audit fields for specific globals
      usernameField: 'email', // Field to use for tracking user (default: 'email')
      fullAudits: {
        disabled: false, // Set to true to disable detailed audit logs
        excludedCollections: ['sensitive-collection'], // Skip full audits for specific collections
        excludedGlobals: ['sensitive-global'], // Skip full audits for specific globals
      },
    }),
  ],
  // ... rest of your config
})
```

Define your autoRun config so the audits queue get processed

```typescript
import {DEFAULT_QUEUE_AUTORUN_CONFIG} from '@flexiweb/audit/constants'
 // ... payload config
 jobs: {
    autoRun: [DEFAULT_QUEUE_AUTORUN_CONFIG],
  },
 // ... payload config

```

#### 2. Audit Fields Are Automatically Added

Once the plugin is added, all collections and globals automatically receive audit fields:

```typescript
// No additional configuration needed!
// The plugin automatically adds:
// - audit.createdBy
// - audit.updatedBy
// - audit.createdAt
// - audit.updatedAt
// - audit.publishedBy (if drafts enabled)
// - audit.publishedAt (if drafts enabled)
```

#### 3. View Audit Logs

The plugin creates an `audit-logs` collection that you can access in the admin panel:

- Navigate to the "Audit-Logs" collection in the admin panel
- View all tracked changes with before/after data
- Filter by collection, action type, user, or date
- Only admin users can access audit logs

#### 4. Access Audit Data Programmatically

```typescript
// Query audit logs
const auditLogs = await payload.find({
  collection: 'audit-logs',
  where: {
    slug: { equals: 'my-collection' },
    action: { equals: 'update' },
  },
})

// Access audit fields on documents
const doc = await payload.findByID({
  collection: 'my-collection',
  id: 'some-id',
})

console.log(doc.audit.createdBy) // "user@example.com (123)"
console.log(doc.audit.updatedAt) // "2024-01-15T10:30:00.000Z"
```

#### 5. Configure Field-Level Redaction and Ignoring

You can control how fields appear in audit logs by adding custom properties to your field definitions:

```typescript
{
  slug: 'my-collection',
  fields: [
    {
      name: 'title',
      type: 'text',
      // Normal field - appears in audit logs
    },
    {
      name: 'secret',
      type: 'text',
      custom: {
        flexiweb: {
          audit: {
            isRedacted: true, // Will appear as "REDACTED" in audit logs
          },
        },
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      custom: {
        flexiweb: {
          audit: {
            ignore: true, // Completely excluded from audit logs
          },
        },
      },
    },
    {
      name: 'sensitiveGroup',
      type: 'group',
      custom: {
        flexiweb: {
          audit: {
            isRedacted: true, // Entire group redacted
          },
        },
      },
      fields: [
        { name: 'data1', type: 'text' },
        { name: 'data2', type: 'text' },
      ],
    },
  ],
}
```

---

## Components

### Audit Fields

The plugin automatically adds audit fields to all collections and globals in a collapsible "Audit" group.

#### Standard Audit Fields

All collections and globals receive these fields:

- **`audit.createdBy`** (text) - Who created the document (format: "username (userId)")
- **`audit.updatedBy`** (text) - Who last updated the document
- **`audit.createdAt`** (date) - When the document was created (server timestamp)
- **`audit.updatedAt`** (date) - When the document was last updated (server timestamp)

#### Draft-Enabled Collections

Collections with drafts enabled also receive:

- **`audit.publishedBy`** (text) - Who published the document
- **`audit.publishedAt`** (date) - When the document was published

#### Field Properties

- All audit fields are **read-only** - users cannot modify them
- Only **admin users** can view audit fields
- Fields are automatically populated by hooks
- Timestamps use server time, not client time

### Audit Logs Collection

The plugin creates a dedicated `audit-logs` collection for comprehensive change tracking.

#### Collection Fields

- **`userId`** (text) - ID of the user who made the change
- **`type`** (text) - Type of entity (`collection` or `global`)
- **`slug`** (text) - Slug of the collection or global
- **`action`** (text) - Action performed (`create`, `update`, or `delete`)
- **`docId`** (text) - ID of the document that was changed
- **`context`** (json) - Detailed context including:
  - `data.before` - Previous values (for updates/deletes)
  - `data.after` - New values (for creates/updates)
  - `user` - User information (id, email, role, etc.)

#### Access Control

- **Create**: Disabled (only system can create audit logs)
- **Read**: Admin users only
- **Update**: Disabled (audit logs are immutable)
- **Delete**: Disabled (audit logs are immutable)

#### Admin Configuration

- Default columns: `id`, `action`, `type`, `slug`, `docId`, `context`, `createdAt`
- Grouped under "Security" in the admin panel
- Can be hidden if full audits are disabled

### Automatic Change Tracking

The plugin uses PayloadCMS hooks to automatically track changes.

#### Collection Hooks

**Before Change Hook** (`setAuditData`):

- Sets `audit.createdBy` and `audit.createdAt` on create
- Sets `audit.updatedBy` and `audit.updatedAt` on update
- Sets `audit.publishedBy` and `audit.publishedAt` when publishing

**After Change Hook** (`createAuditLogsAfterCollectionChange`):

- Queues audit log creation for create and update operations
- Captures before/after data using smart diffing
- Only runs if full audits are enabled

**After Delete Hook** (`createAuditLogsAfterCollectionDelete`):

- Queues audit log creation for delete operations
- Captures the deleted document data
- Only runs if full audits are enabled

#### Global Hooks

**Before Change Hook** (`setAuditData`):

- Sets `audit.updatedBy` and `audit.updatedAt` on global changes

**After Change Hook** (`createAuditLogsAfterGlobalChange`):

- Queues audit log creation for global changes
- Captures before/after data
- Only runs if full audits are enabled

#### Background Job Processing

Audit logs are processed asynchronously via PayloadCMS jobs:

- **Task**: `createAuditLog`
- **Queue**: `audit`
- **Auto-run**: Every minute (configurable)
- **Batch Size**: 500 logs per run (configurable)

### Security Features

#### Automatic Field Redaction

Sensitive fields are automatically redacted in audit logs:

- `password`, `passwordConfirm`
- `secret`, `token`, `resetToken`
- `apiKey`, `privateKey`
- `refreshToken`, `accessToken`
- `sessionToken`, `sessionSecret`
- `salt`, `hash`
- `loginAttempts`, `lockUntil`
- `sessions`, `cvc`

Redacted values appear as `[REDACTED]` in audit logs.

#### Field Filtering

Certain fields are excluded from audit logs:

- `loginAt`, `lastLogin`
- `audit` (to prevent circular references)

#### Custom Field-Level Configuration

You can control how individual fields are handled in audit logs by adding custom properties to your field definitions. This provides fine-grained control over redaction and exclusion at the field level.

##### Redacting Fields

To redact a specific field in audit logs, add `isRedacted: true` to the field's custom configuration:

```typescript
{
  name: 'secret',
  type: 'text',
  custom: {
    flexiweb: {
      audit: {
        isRedacted: true,
        path: 'secret', // Optional: explicit path (defaults to field name)
      },
    },
  },
}
```

Redacted fields will appear as `REDACTED` in audit logs instead of their actual values.

##### Ignoring Fields

To completely exclude a field from audit logs, add `ignore: true`:

```typescript
{
  name: 'audit',
  type: 'group',
  custom: {
    flexiweb: {
      audit: {
        ignore: true,
        path: 'audit', // Optional: explicit path
      },
    },
  },
  fields: [
    { name: 'createdAt', type: 'date' },
    { name: 'updatedAt', type: 'date' },
  ],
}
```

Ignored fields are completely removed from audit log diffs.

##### Redacting Relationships

You can redact relationship fields, which will convert the relationship to its ID and then redact it:

```typescript
{
  name: 'user',
  type: 'relationship',
  relationTo: 'users',
  custom: {
    flexiweb: {
      audit: {
        isRedacted: true,
        path: 'user',
      },
    },
  },
}
```

##### Group-Level Redaction

You can redact entire groups by adding the property to the group field:

```typescript
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
}
```

The entire group will appear as `REDACTED` in audit logs.

##### Partial Group Redaction

You can redact specific fields within a group while keeping others visible:

```typescript
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
      // This field will appear normally in audit logs
    },
    {
      name: 'g3',
      type: 'text',
      custom: {
        flexiweb: {
          audit: {
            ignore: true,
            path: 'partlyRedactedGroup.g3',
          },
        },
      },
    },
  ],
}
```

##### Nested Groups

Custom audit properties work with nested groups as well:

```typescript
{
  name: 'nested',
  type: 'group',
  fields: [
    { name: 'a', type: 'text' }, // Normal field
    {
      name: 'b',
      type: 'text',
      custom: {
        flexiweb: {
          audit: {
            isRedacted: true,
            path: 'nested.b',
          },
        },
      },
    },
  ],
}
```

##### Path Specification

The `path` property is optional but recommended for nested fields. If not specified, the plugin will automatically construct the path from the field hierarchy. Explicit paths are useful for:

- Ensuring correct path matching in nested structures
- Handling complex field relationships
- Debugging audit log issues

**Note**: The path should match the full dot-notation path to the field (e.g., `partlyRedactedGroup.g1` for a field `g1` inside a group `partlyRedactedGroup`).

### Configuration

#### Plugin Configuration Options

```typescript
type AuditPluginConfig = {
  // Exclude collections from receiving audit fields
  excludedCollections?: CollectionSlug[]

  // Exclude globals from receiving audit fields
  excludedGlobals?: string[]

  // Full audit logging configuration
  fullAudits: {
    disabled: boolean // Disable detailed audit logs
    excludedCollections: CollectionSlug[] // Skip full audits for specific collections
    excludedGlobals: GlobalSlug[] // Skip full audits for specific globals
  }

  // Override audit logs collection
  overrides?: {
    audits?: {
      fieldOverrides?: AuditFieldOverrides // Customize audit log fields
      overrides?: Omit<CollectionConfig, 'fields' | 'slug'> // Customize collection config
    }
  }

  // User field to use for tracking (default: 'email')
  usernameField?: string
}
```

#### Example Configuration

```typescript
flexiwebAuditPlugin({
  // Skip audit fields for these collections
  excludedCollections: ['sessions', 'media'],

  // Skip audit fields for these globals
  excludedGlobals: ['site-settings'],

  // Use a different user field
  usernameField: 'username',

  // Configure full audits
  fullAudits: {
    disabled: false,
    // Skip full audits for high-volume collections
    excludedCollections: ['analytics-events', 'webhooks'],
    excludedGlobals: [],
  },

  // Customize audit logs collection
  overrides: {
    audits: {
      overrides: {
        admin: {
          defaultColumns: ['id', 'action', 'slug', 'createdAt'],
        },
      },
    },
  },
})
```

---

## Overrides & Customization

The plugin is designed to be highly configurable while maintaining security and consistency.

### Excluding Collections and Globals

You can exclude specific collections or globals from receiving audit fields:

```typescript
flexiwebAuditPlugin({
  excludedCollections: ['sessions', 'media', 'cache'],
  excludedGlobals: ['site-settings'],
})
```

### Disabling Full Audits

You can disable detailed audit logging while keeping basic audit fields:

```typescript
flexiwebAuditPlugin({
  fullAudits: {
    disabled: true, // Only audit fields, no detailed logs
  },
})
```

### Selective Full Audits

You can enable full audits for most collections but exclude high-volume ones:

```typescript
flexiwebAuditPlugin({
  fullAudits: {
    disabled: false,
    excludedCollections: ['analytics-events', 'webhook-logs'], // Skip these
    excludedGlobals: ['high-frequency-settings'],
  },
})
```

### Customizing Audit Logs Collection

You can customize the audit logs collection fields and configuration:

```typescript
flexiwebAuditPlugin({
  overrides: {
    audits: {
      fieldOverrides: {
        userIdOverrides: {
          label: { en: 'User', de: 'Benutzer' },
        },
        actionOverrides: {
          admin: {
            description: { en: 'The action that was performed', de: 'Die durchgeführte Aktion' },
          },
        },
      },
      overrides: {
        admin: {
          defaultColumns: ['id', 'action', 'slug', 'createdAt'],
          group: {
            en: 'Audit',
            de: 'Audit',
          },
        },
      },
    },
  },
})
```

### Custom Username Field

If your user collection uses a different field for usernames:

```typescript
flexiwebAuditPlugin({
  usernameField: 'username', // Default is 'email'
})
```

### Field-Level Redaction and Ignoring

You can control how individual fields are handled in audit logs by adding custom properties directly to your field definitions. This is the recommended approach for fine-grained control over sensitive data:

```typescript
{
  slug: 'products',
  fields: [
    {
      name: 'name',
      type: 'text',
      // Normal field - appears in audit logs
    },
    {
      name: 'apiKey',
      type: 'text',
      custom: {
        flexiweb: {
          audit: {
            isRedacted: true, // Appears as "REDACTED" in audit logs
          },
        },
      },
    },
    {
      name: 'internalMetadata',
      type: 'group',
      custom: {
        flexiweb: {
          audit: {
            ignore: true, // Completely excluded from audit logs
          },
        },
      },
      fields: [
        { name: 'notes', type: 'textarea' },
      ],
    },
  ],
}
```

This approach works alongside the automatic redaction of common sensitive fields (passwords, tokens, etc.) and gives you complete control over your audit trail.

### Accessing Audit Data

You can access audit fields and logs programmatically:

```typescript
// Access audit fields on a document
const doc = await payload.findByID({
  collection: 'posts',
  id: 'some-id',
})

console.log(doc.audit.createdBy) // "user@example.com (123)"
console.log(doc.audit.updatedAt) // ISO date string

// Query audit logs
const auditLogs = await payload.find({
  collection: 'audit-logs',
  where: {
    slug: { equals: 'posts' },
    action: { equals: 'update' },
    createdAt: { greater_than: '2024-01-01' },
  },
  limit: 100,
})

// Access context data
auditLogs.docs.forEach((log) => {
  console.log('Before:', log.context.data.before)
  console.log('After:', log.context.data.after)
  console.log('User:', log.context.user)
})
```

---

## Documentation

### Type Definitions

All types are exported and available for use:

```typescript
import type {
  AuditPluginConfig,
  AuditFieldOverrides,
  AuditType,
  AuditActionType,
} from '@flexiweb/audit/types'
```

### Constants

Useful constants are exported:

```typescript
import {
  AUDIT_LOGS_SLUG,
  DEFAULT_USERNAME_FIELD,
  AUDIT_GROUP_NAME,
  CREATED_BY_FIELD_NAME,
  UPDATED_BY_FIELD_NAME,
  // ... and more
} from '@flexiweb/audit/constants'
```

### Utilities

Utility functions for working with audit data:

```typescript
import { filterChangedKeysKeepObjects, redactKeys, enqueueAuditLog } from '@flexiweb/audit/utils'
```

### How It Works

1. **Plugin Initialization**: When the plugin is added to your Payload config, it:
   - Creates the `audit-logs` collection
   - Adds audit fields to all collections and globals (unless excluded)
   - Registers hooks for change tracking
   - Sets up background job processing (if full audits enabled)

2. **Change Tracking**: When a document is created, updated, or deleted:
   - The `beforeChange` hook sets audit field values
   - The `afterChange`/`afterDelete` hook queues an audit log (if enabled)
   - The background job processes queued audit logs asynchronously

3. **Data Security**: Before storing audit logs:
   - Sensitive fields are automatically redacted
   - Certain fields are excluded from tracking
   - Nested objects are recursively processed

### Best Practices

- **Performance**: Exclude high-volume collections from full audits
- **Privacy**: Review and extend the redaction list for your use case
- **Storage**: Consider archiving old audit logs periodically
- **Access**: Only admin users should have access to audit data
- **Monitoring**: Monitor the audit queue to ensure logs are being processed

---

## Contributing

Contributions are currently **not yet** being accepted due to the rapid development pace and "move quick, break things" philosophy. However, we welcome:

- Bug reports
- Feature suggestions
- Documentation improvements

Once the plugin stabilizes, we'll open up for contributions. In the meantime, feel free to fork and customize for your needs!

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Welle-IT/flexiweb-plugin-audit.git

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run development server
pnpm dev

# Run tests
pnpm test
```

---

## License

This software is provided free of charge for use, modification, and distribution by any individual or legal entity ("Licensee") whose total annual gross revenue does not exceed USD 250,000.

If the Licensee’s annual gross revenue exceeds USD 250,000, a paid commercial license is required.
For commercial licensing, contact the [maintainer](mailto:welledigital882@gmail.com) at welledigital882@gmail.com.

See [LICENSE.md](LICENSE.md) for full license details.

---

<div align="center">

**Built with ❤️ for the PayloadCMS community**

[Website](https://flexiweb.dev) • [GitHub](https://github.com/Welle-IT/flexiweb-plugin-audit) • [Documentation](#documentation)

</div>
