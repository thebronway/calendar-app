const { ADMIN_PASSWORD } = require('../../utils/authUtils');
const { validateLocalUser } = require('./localProvider');

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
  if (provider === 'local') {
    return validateLocalUser(username, password);
  }
  
  // Future SSO/LDAP providers will hook in here seamlessly
  // if (provider === 'ldap') { return await validateLdapUser(username, password); }

  return { success: false, error: 'Unknown authentication provider configured.' };
};

module.exports = { authenticateUser };