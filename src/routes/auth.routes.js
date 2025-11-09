import { Router } from "express";
import registerController from "../controllers/registerController.js";
import loginController from "../controllers/loginController.js";
import logoutController from "../controllers/logoutController.js";
import profileController from "../controllers/profileController.js";
import privacyPolicyController from "../controllers/privacyPolicyController.js";
import privacyPolicyTextController from "../controllers/privacyPolicyTextController.js";
import verifyToken from "../middleware/verifyToken.js";
import deleteAccountController from "../controllers/deleteAccountController.js";
import exportController from "../controllers/exportController.js";
import { verifyCSRFToken, getCSRFToken } from "../middleware/csrfProtection.js";
import { getConsents, updateConsent } from "../controllers/consentController.js";
import {
    manualCleanup,
    getRetentionStatusController,
    getRetentionReport,
    getLogs,
    getNextReviewDate
} from "../controllers/dataRetentionController.js";
import { submitGDPRRequest, getUserRequests } from "../controllers/gdprSupportController.js";
import { reportBreach, getBreachLogs } from "../controllers/breachNotificationController.js";

// ✅ NYA IMPORTS
import getUserInfo from "../controllers/userInfoController.js";
import updatePrivacy from "../controllers/updatePrivacyController.js";
import updateProfile from "../controllers/updateProfileController.js";

const router = Router();

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/privacy-policy", privacyPolicyController);
router.get("/privacy-policy-text", privacyPolicyTextController);

// ✅ PUBLIC USER INFO
router.get("/users/:userId", getUserInfo);

// CSRF token
router.get("/csrf-token", getCSRFToken);

// Protected routes
router.post("/logout", verifyToken, logoutController);
router.get("/profile", verifyToken, profileController);
router.delete("/account", verifyToken, verifyCSRFToken, deleteAccountController);
router.get("/export", verifyToken, exportController);

// ✅ NYA PROFILE ROUTES
router.put("/profile", verifyToken, verifyCSRFToken, updateProfile);
router.put("/profile/privacy", verifyToken, verifyCSRFToken, updatePrivacy);

// Consent management
router.get("/consents", verifyToken, getConsents);
router.put("/consents", verifyToken, verifyCSRFToken, updateConsent);

// GDPR Support
router.post("/gdpr-request", verifyToken, verifyCSRFToken, submitGDPRRequest);
router.get("/gdpr-requests", verifyToken, getUserRequests);

// Breach Notification
router.post("/breach/report", reportBreach);
router.get("/breach/logs", getBreachLogs);

// Data Retention (Admin endpoints)
router.get("/admin/retention/status", getRetentionStatusController);
router.post("/admin/retention/cleanup", manualCleanup);
router.get("/admin/retention/report", getRetentionReport);
router.get("/admin/retention/logs", getLogs);
router.get("/admin/retention/next-review", getNextReviewDate);

export default router;