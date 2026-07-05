const { readAccess } = require('../../utils/fileOps');
const { verifyPassword } = require('../../utils/authUtils');

/**
 * Validates credentials against the local access.json database
 */
const validateLocalUser = (username, password) => {
  const accessList = readAccess();
  const now = new Date();
  
  const matchedView = accessList.find(a => a.name.toLowerCase() === username.toLowerCase());

  if (matchedView) {
    if (matchedView.expiresAt && new Date(matchedView.expiresAt) < now) {
       return { success: false, error: 'Account expired' };
    } else if (verifyPassword(password, matchedView.passwordHash)) {
      return { success: true, role: 'view', accountName: matchedView.name };
    }
  }
  
  return { success: false, error: 'Unauthorized' };
};

module.exports = { validateLocalUser };