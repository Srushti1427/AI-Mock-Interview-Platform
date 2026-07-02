/**
 * Check if a given email is the admin email.
 * Uses the ADMIN_EMAIL environment variable.
 */
export const isAdmin = (email) => {
  if (!email) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_EMAIL environment variable is not set.");
    return false;
  }
  return email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
};
