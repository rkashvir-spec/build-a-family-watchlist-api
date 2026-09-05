export function authorizeModification(req, res, next) {
  const user = req.user;
  const targetUserId = req.params.userId;

  // Ensure robust string comparison for cross-type matching
  if (user.role === 'parent' || String(user.id) === String(targetUserId)) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
