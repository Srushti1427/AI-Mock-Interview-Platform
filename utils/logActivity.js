import { UserActivity } from "@/utils/schema";
import moment from "moment";

/**
 * Log a user activity event to MongoDB.
 *
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {Object} params
 * @param {string} params.email - User's email
 * @param {string} [params.name] - User's display name
 * @param {string} [params.avatarUrl] - User's avatar URL
 * @param {string} params.action - Action type: "login", "interview_created", "aptitude_created", "feedback_submitted"
 * @param {Object} [params.metadata] - Additional metadata about the action
 */
export async function logActivity(db, { email, name, avatarUrl, action, metadata = {} }) {
  try {
    await db.collection(UserActivity).insertOne({
      email,
      name: name || "",
      avatarUrl: avatarUrl || "",
      action,
      metadata,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      timestamp: new Date(),
    });
  } catch (err) {
    // Don't let activity logging break the main flow
    console.error("Failed to log activity:", err);
  }
}
