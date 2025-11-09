import crypto from "crypto";

const csrfTokens = new Map();

const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getCSRFToken = (req, res) => {
    const userId = req.user?.id || req.sessionID || 'anonymous';

    let token = csrfTokens.get(userId);

    if (!token) {
        token = generateCSRFToken();
        csrfTokens.set(userId, token);
    }

    res.status(200).json({ csrfToken: token });
};

const verifyCSRFToken = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const userId = req.user?.id || req.sessionID || 'anonymous';
    const tokenFromHeader = req.headers['x-csrf-token'];
    const tokenFromBody = req.body?.csrfToken;

    const submittedToken = tokenFromHeader || tokenFromBody;
    const storedToken = csrfTokens.get(userId);

    if (!submittedToken) {
        return res.status(403).json({
            message: "CSRF token missing"
        });
    }

    if (submittedToken !== storedToken) {
        return res.status(403).json({
            message: "Invalid CSRF token"
        });
    }

    next();
};

const clearCSRFToken = (userId) => {
    csrfTokens.delete(userId);
};

export { getCSRFToken, verifyCSRFToken, clearCSRFToken };