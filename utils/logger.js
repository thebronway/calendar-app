const logError = (context, error, additionalData = {}) => {
  console.error(`[ERROR] ${context}:`, {
    message: error.message,
    stack: error.stack,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { logError };