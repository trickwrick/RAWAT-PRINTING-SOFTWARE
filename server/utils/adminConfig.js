export const DEFAULT_ADMIN_EMAIL = 'admin@rawatprinters.com';
export const DEFAULT_ADMIN_PASSWORD = 'Rawat@Admin#2026';
export const LEGACY_ADMIN_EMAIL = 'admin@gmail.com';

export const isAdminEmail = (email) =>
  String(email || '').trim().toLowerCase() === DEFAULT_ADMIN_EMAIL;
