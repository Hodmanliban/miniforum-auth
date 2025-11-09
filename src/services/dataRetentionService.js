import cron from 'node-cron';
import User from '../models/User.js';

const RETENTION_INACTIVE_USERS_DAYS = parseInt(process.env.RETENTION_INACTIVE_USERS_DAYS) || 1095;
const RETENTION_DELETED_USERS_DAYS = parseInt(process.env.RETENTION_DELETED_USERS_DAYS) || 30;

const cleanupLogs = [];
const MAX_LOGS = 1000;

const logCleanup = (message) => {
    const logEntry = {
        timestamp: new Date(),
        message
    };
    cleanupLogs.push(logEntry);
    if (cleanupLogs.length > MAX_LOGS) {
        cleanupLogs.shift();
    }
    console.log(`[Data Retention] ${message}`);
};

const anonymizeInactiveUsers = async () => {
    try {
        const inactiveDate = new Date();
        inactiveDate.setDate(inactiveDate.getDate() - RETENTION_INACTIVE_USERS_DAYS);

        // ÄNDRAT: lastLogin → lastLoginAt
        const inactiveUsers = await User.find({
            lastLoginAt: { $lt: inactiveDate },
            deleted: { $ne: true }
        });

        for (const user of inactiveUsers) {
            user.email = `anonymized_${user._id}@deleted.local`;
            user.name = "Anonymized User";
            user.passwordHash = "ANONYMIZED";
            user.deleted = true;
            user.deletedAt = new Date();
            await user.save();
        }

        logCleanup(`Anonymized ${inactiveUsers.length} inactive users (inactive > ${RETENTION_INACTIVE_USERS_DAYS} days)`);
        return inactiveUsers.length;
    } catch (error) {
        logCleanup(`Error anonymizing inactive users: ${error.message}`);
        return 0;
    }
};

const deleteOldDeletedUsers = async () => {
    try {
        const deleteDate = new Date();
        deleteDate.setDate(deleteDate.getDate() - RETENTION_DELETED_USERS_DAYS);

        const result = await User.deleteMany({
            deleted: true,
            deletedAt: { $lt: deleteDate }
        });

        logCleanup(`Permanently deleted ${result.deletedCount} users (deleted > ${RETENTION_DELETED_USERS_DAYS} days ago)`);
        return result.deletedCount;
    } catch (error) {
        logCleanup(`Error deleting old users: ${error.message}`);
        return 0;
    }
};

const runCleanup = async () => {
    logCleanup("Starting scheduled data retention cleanup...");
    const anonymized = await anonymizeInactiveUsers();
    const deleted = await deleteOldDeletedUsers();
    logCleanup(`Cleanup completed: ${anonymized} anonymized, ${deleted} deleted`);
    return { anonymized, deleted };
};

// GDPR Review Reminder - Quarterly
const checkGDPRReviewDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Kvartalsvis: Januari (0), April (3), Juli (6), Oktober (9)
    const reviewMonths = [0, 3, 6, 9];

    if (reviewMonths.includes(currentMonth) && currentDay === 1) {
        const quarter = Math.floor(currentMonth / 3) + 1;

        console.warn(`
========================================================================
         GDPR COMPLIANCE REVIEW REMINDER - Q${quarter} ${now.getFullYear()}
========================================================================
Action Required: Quarterly GDPR Compliance Review

Tasks:
1. Review and update GDPR_COMPLIANCE.md
2. Review and update DATA_RETENTION.md
3. Review and update SECURITY.md
4. Update privacy policy if needed
5. Check for new GDPR regulations
6. Review consent logs and audit trails
7. Test all GDPR endpoints
8. Update "Last Updated" dates in documentation

Contact: privacy@miniforum.se
Deadline: End of ${getQuarterName(quarter)}
========================================================================
        `);

        logCleanup(`GDPR Review Reminder sent for Q${quarter} ${now.getFullYear()}`);
    }
};

const getQuarterName = (quarter) => {
    const quarters = {
        1: "March",
        2: "June",
        3: "September",
        4: "December"
    };
    return quarters[quarter];
};

// GDPR Review Reminder - Annual
const checkAnnualGDPRReview = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Årlig review: 1 januari
    if (currentMonth === 0 && currentDay === 1) {
        console.warn(`
========================================================================
       ANNUAL GDPR COMPLIANCE REVIEW REMINDER ${now.getFullYear()}
========================================================================
Action Required: Annual GDPR Policy Review

Tasks:
1. Full legal review of all GDPR documentation
2. Update privacy policy version
3. Review third-party processors (MongoDB Atlas, etc.)
4. Audit all data retention periods
5. Review security measures and encryption
6. Test breach notification procedures
7. Review user consent mechanisms
8. Update all "Last Updated" and "Version" fields
9. Send policy updates to users if needed
10. Document all changes for audit trail

Recommended: Consult with legal team
Contact: privacy@miniforum.se
Deadline: End of January ${now.getFullYear()}
========================================================================
        `);

        logCleanup(`Annual GDPR Review Reminder sent for ${now.getFullYear()}`);
    }
};

const startDataRetentionService = () => {
    // Daglig cleanup kl 02:00
    cron.schedule('0 2 * * *', async () => {
        await runCleanup();
    });

    // Kolla GDPR review varje dag kl 09:00
    cron.schedule('0 9 * * *', () => {
        checkGDPRReviewDate();
        checkAnnualGDPRReview();
    });

    console.log("Data Retention Service started (runs daily at 2:00 AM)");
    console.log("GDPR Review Reminder active (checks daily at 9:00 AM)");
};

const getCleanupLogs = () => {
    return cleanupLogs;
};

const getRetentionStatus = async () => {
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - RETENTION_INACTIVE_USERS_DAYS);

    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - RETENTION_DELETED_USERS_DAYS);

    // ÄNDRAT: lastLogin → lastLoginAt
    const inactiveCount = await User.countDocuments({
        lastLoginAt: { $lt: inactiveDate },
        deleted: { $ne: true }
    });

    const pendingDeletionCount = await User.countDocuments({
        deleted: true,
        deletedAt: { $lt: deleteDate }
    });

    const totalUsers = await User.countDocuments({ deleted: { $ne: true } });
    const deletedUsers = await User.countDocuments({ deleted: true });

    return {
        totalActiveUsers: totalUsers,
        totalDeletedUsers: deletedUsers,
        usersToBeAnonymized: inactiveCount,
        usersToBePermanentlyDeleted: pendingDeletionCount,
        retentionPolicies: {
            inactiveUsersDays: RETENTION_INACTIVE_USERS_DAYS,
            deletedUsersDays: RETENTION_DELETED_USERS_DAYS
        },
        nextScheduledCleanup: "Daily at 2:00 AM",
        nextGDPRReviewCheck: "Daily at 9:00 AM"
    };
};

export {
    startDataRetentionService,
    runCleanup,
    getCleanupLogs,
    getRetentionStatus
};