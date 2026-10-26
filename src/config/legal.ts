import { SITE } from './site';

export const CONTACT_EMAIL = 'hello@mindleap.ro';
export const LEGAL_LAST_UPDATED = new Date('2026-06-27');

export function getLegalFullAddress(): string {
  const { address } = SITE;
  return `${address.street}, ${address.city}, jud. ${address.county}, ${address.postalCode}, ${address.country}`;
}
