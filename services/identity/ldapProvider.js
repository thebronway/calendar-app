const { Client } = require('ldapts');
const { readConfig } = require('../../utils/fileOps');

const BIND_DN = process.env.LDAP_BIND_DN;
const BIND_PASSWORD = process.env.LDAP_BIND_PASSWORD;

// Safely escape arbitrary strings to prevent LDAP injection
const escapeFilter = (str) => str.replace(/[\*\(\)\\]/g, (c) => '\\' + c.charCodeAt(0).toString(16));

const testLdapConnection = async (testConfig) => {
  if (!testConfig.ldapServerUrl || !testConfig.ldapBaseDn) {
    return { success: false, error: 'Server URL and Base DN are required.' };
  }
  
  const client = new Client({ url: testConfig.ldapServerUrl, timeout: 5000 });
  
  try {
    if (BIND_DN && BIND_PASSWORD) {
      await client.bind(BIND_DN, BIND_PASSWORD);
    } else {
      await client.bind('', ''); // Attempt anonymous bind
    }

    const results = {
      success: true,
      adminGroup: { count: 0, sample: [] },
      viewGroup: { count: 0, sample: [] }
    };

    const fetchGroupMembers = async (groupName) => {
      if (!groupName) return { count: 0, sample: [] };
      try {
        // Smart parse: extract just the CN if the user pasted a full comma-separated string
        const cleanGroupName = groupName.split(',')[0].replace(/^cn=/i, '').trim();
        
        const { searchEntries } = await client.search(testConfig.ldapBaseDn, {
          scope: 'sub',
          filter: `(&(|(objectClass=group)(objectClass=groupOfNames)(objectClass=groupOfUniqueNames)(objectClass=posixGroup))(cn=${escapeFilter(cleanGroupName)}))`,
          attributes: ['member', 'memberUid', 'uniqueMember'] // Supports AD, LLDAP, and POSIX
        });
        
        if (searchEntries.length === 0) return { count: 0, sample: [] };
        
        const group = searchEntries[0];
        let members = group.member || group.uniqueMember || group.uniquemember || group.memberUid || [];
        if (!Array.isArray(members)) members = [members];

        // Format to just usernames for cleaner display
        const sample = members.slice(0, 25).map(m => {
          if (m.includes('=')) return m.split(',')[0].split('=')[1] || m;
          return m;
        });

        return { count: members.length, sample };
      } catch (e) {
         return { count: 0, sample: [] };
      }
    };

    results.adminGroup = await fetchGroupMembers(testConfig.ldapAdminGroup);
    results.viewGroup = await fetchGroupMembers(testConfig.ldapViewGroup);

    await client.unbind();
    return results;

  } catch (err) {
    return { success: false, error: err.message || 'Failed to bind to LDAP server.' };
  }
};

const validateLdapUser = async (username, password) => {
  const config = readConfig();
  if (!config.ldapServerUrl || !config.ldapBaseDn) {
    return { success: false, error: 'LDAP is not fully configured.' };
  }

  const client = new Client({ url: config.ldapServerUrl, timeout: 5000 });

  try {
    // Step 1: Bind with service account to locate the user's distinguished name (DN)
    if (BIND_DN && BIND_PASSWORD) {
      await client.bind(BIND_DN, BIND_PASSWORD);
    } else {
      await client.bind('', '');
    }

    const { searchEntries } = await client.search(config.ldapBaseDn, {
      scope: 'sub',
      filter: `(&(|(objectClass=user)(objectClass=person))(|(uid=${escapeFilter(username)})(sAMAccountName=${escapeFilter(username)})))`,
      attributes: ['dn']
    });

    if (searchEntries.length === 0) {
      await client.unbind();
      return { success: false, error: 'User not found in directory.' };
    }

    const userDn = searchEntries[0].dn;

    // Step 2: Attempt a bind as the user themselves to verify the password
    const userClient = new Client({ url: config.ldapServerUrl, timeout: 5000 });
    try {
      await userClient.bind(userDn, password);
      await userClient.unbind();
    } catch (pwErr) {
      await client.unbind();
      return { success: false, error: 'Invalid directory password.' };
    }

    // Step 3: Check Group Membership
    const checkGroup = async (groupName) => {
      if (!groupName) return false;
      try {
        const cleanGroupName = groupName.split(',')[0].replace(/^cn=/i, '').trim();
        const { searchEntries: groupEntries } = await client.search(config.ldapBaseDn, {
          scope: 'sub',
          filter: `(&(|(objectClass=group)(objectClass=groupOfNames)(objectClass=groupOfUniqueNames)(objectClass=posixGroup))(cn=${escapeFilter(cleanGroupName)}))`,
          attributes: ['member', 'memberUid', 'uniqueMember']
        });
        if (groupEntries.length === 0) return false;
        
        const group = groupEntries[0];
        let members = group.member || group.uniqueMember || group.uniquemember || group.memberUid || [];
        if (!Array.isArray(members)) members = [members];
        
        return members.includes(userDn) || members.includes(username);
      } catch(e) {
        return false;
      }
    };

    const isAdmin = await checkGroup(config.ldapAdminGroup);
    const isView = await checkGroup(config.ldapViewGroup);

    await client.unbind();

    // Enforce Overlap Priority (Admin wins if in both groups)
    if (isAdmin) {
      return { success: true, role: 'admin', accountName: username };
    }
    if (isView) {
      return { success: true, role: 'view', accountName: username };
    }

    return { success: false, error: 'Access Denied: Not a member of the required calendar groups.' };

  } catch (err) {
    return { success: false, error: 'Directory connection failed.' };
  }
};

module.exports = { validateLdapUser, testLdapConnection };