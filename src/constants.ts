export const AUDIT_LOGS_SLUG = 'audit-logs'
export const DEFAULT_USERNAME_FIELD = 'email'
export const DEFAULT_USERNAME = 'System'
export const DEFAULT_ID = '-'
export const AUDIT_GROUP_NAME = 'audit'
export const UPDATED_BY_FIELD_NAME = 'updatedBy'
export const CREATED_BY_FIELD_NAME = 'createdBy'
export const CREATED_AT_FIELD_NAME = 'createdAt'
export const UPDATED_AT_FIELD_NAME = 'updatedAt'
export const PUBLISHED_BY_FIELD_NAME = 'publishedBy'
export const PUBLISHED_AT_FIELD_NAME = 'publishedAt'
export const REDACTED = '[REDACTED]'
export const GLOBAL_REDACT_KEYS = [
  'password',
  'passwordConfirm',
  'secret',
  'token',
  'resetToken',
  'apiKey',
  'privateKey',
  'refreshToken',
  'accessToken',
  'sessionToken',
  'sessionSecret',
  'salt',
  'hash',
  'loginAttempts',
  'lockUntil',
  'sessions',
  'cvc',
]
export const GLOBAL_IGNORE_KEYS = ['loginAt', 'lastLogin', 'audit']
