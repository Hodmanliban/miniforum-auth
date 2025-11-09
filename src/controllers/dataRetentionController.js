import { runCleanup, getCleanupLogs, getRetentionStatus } from '../services/dataRetentionService.js';

// Manual cleanup endpoint
const manualCleanup = async (req, res) => {
    try {
        const result = await runCleanup();
        res.status(200).json({
            message: "Manual cleanup completed successfully",
            result
        });
    } catch (error) {
        res.status(500).json({
            error: "Cleanup failed",
            details: error.message
        });
    }
};

// Get retention status
const getRetentionStatusController = async (req, res) => {
    try {
        const status = await getRetentionStatus();
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get retention status",
            details: error.message
        });
    }
};

// Get detailed retention report
const getRetentionReport = async (req, res) => {
    try {
        const status = await getRetentionStatus();
        const logs = getCleanupLogs();

        res.status(200).json({
            status,
            recentCleanups: logs.slice(-10),
            totalCleanupRuns: logs.length
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to generate report",
            details: error.message
        });
    }
};

// Get cleanup logs
const getLogs = (req, res) => {
    const logs = getCleanupLogs();
    const limit = parseInt(req.query.limit) || 100;

    res.status(200).json({
        logs: logs.slice(-limit),
        total: logs.length
    });
};

// Get next GDPR review date
const getNextReviewDate = (req, res) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Hitta nästa kvartalsstart
    const reviewMonths = [0, 3, 6, 9]; // Jan, Apr, Jul, Okt
    let nextQuarterMonth = reviewMonths.find(m => m > currentMonth);

    if (!nextQuarterMonth) {
        nextQuarterMonth = 0; // Januari nästa år
    }

    const nextQuarter = Math.floor(nextQuarterMonth / 3) + 1;
    const nextYear = nextQuarterMonth === 0 ? currentYear + 1 : currentYear;
    const nextReviewDate = new Date(nextYear, nextQuarterMonth, 1);

    // Nästa årliga review
    const nextAnnualYear = currentMonth === 0 ? currentYear + 1 : currentYear + 1;
    const nextAnnualReview = new Date(nextAnnualYear, 0, 1);

    res.status(200).json({
        message: "GDPR Review Schedule",
        quarterly: {
            nextReview: nextReviewDate.toISOString().split('T')[0],
            quarter: `Q${nextQuarter} ${nextYear}`,
            daysUntil: Math.ceil((nextReviewDate - now) / (1000 * 60 * 60 * 24))
        },
        annual: {
            nextReview: nextAnnualReview.toISOString().split('T')[0],
            year: nextAnnualYear,
            daysUntil: Math.ceil((nextAnnualReview - now) / (1000 * 60 * 60 * 24))
        },
        schedule: "Reviews checked daily at 9:00 AM"
    });
};

export {
    manualCleanup,
    getRetentionStatusController,
    getRetentionReport,
    getLogs,
    getNextReviewDate
};