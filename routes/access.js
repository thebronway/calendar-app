const express = require('express');
const crypto = require('crypto');
const { readAccess, writeAccess } = require('../utils/fileOps');
const { verifyAdminToken, hashPassword, verifyPassword } = require('../utils/authUtils');

const router = express.Router();

router.get('/', verifyAdminToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const accessList = readAccess().map(a => ({
    id: a.id,
    name: a.name,
    expiresAt: a.expiresAt,
    createdAt: a.createdAt
  }));
  res.json(accessList);
});

router.post('/', verifyAdminToken, (req, res) => {
  const { name, password, expiresAt } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Name and password are required' });
  
  const accessList = readAccess();

  for (const access of accessList) {
    if (access.name.toLowerCase() === name.toLowerCase()) {
      return res.status(409).json({ error: 'name_exists' });
    }
    if (verifyPassword(password, access.passwordHash)) {
      return res.status(409).json({ error: 'password_exists' });
    }
  }

  const newAccess = {
    id: crypto.randomUUID(),
    name,
    passwordHash: hashPassword(password),
    expiresAt: expiresAt || null,
    createdAt: new Date().toISOString()
  };
  
  accessList.push(newAccess);
  if (writeAccess(accessList)) {
    res.json({ id: newAccess.id, name: newAccess.name, expiresAt: newAccess.expiresAt, createdAt: newAccess.createdAt });
  } else {
    res.status(500).json({ error: 'Failed to save access profile' });
  }
});

router.delete('/:id', verifyAdminToken, (req, res) => {
  let accessList = readAccess();
  const initialLength = accessList.length;
  accessList = accessList.filter(a => a.id !== req.params.id);
  
  if (accessList.length === initialLength) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  if (writeAccess(accessList)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete access profile' });
  }
});

module.exports = router;