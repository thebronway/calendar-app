const { ADMIN_PASSWORD } = require('../../utils/authUtils');
const { validateLocalUser } = require('./localProvider');
const { validateLdapUser } = require('./ldapProvider');

/**
 * Unified authentication orchestrator.
 * Enforces Universal Local Admin Precedence before delegating to configured providers.
 */
const authenticateUser = async (username, password, provider = 'local') => {
  // 1. Universal Local Admin Precedence (Hard Fallback Backdoor)
  if (username.toLowerCase() === 'admin' && password === ADMIN_PASSWORD) {
    return { success: true, role: 'admin', accountName: 'Master Admin' };
  }

  // 2. Delegate to active provider based on configuration
  if (provider === 'ldap') {
    const ldapResult = await validateLdapUser(username, password);

    // Priority 1: LDAP Admin
    if (ldapResult.success && ldapResult.role === 'admin') {
      return ldapResult;
    }

    // Priority 2: Local View Profile (Allows local guests to bypass LDAP)
    const localResult = validateLocalUser(username, password);
    if (localResult.success) {
      return localResult;
    }

    // Priority 3: LDAP View
    if (ldapResult.success && ldapResult.role === 'view') {
      return ldapResult;
    }

    // Priority 4: Failed Auth (Either LDAP error or no match found)
    return ldapResult;
  }

  // Default to Local Provider
  return validateLocalUser(username, password);
};

module.exports = { authenticateUser };