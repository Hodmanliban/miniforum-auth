import validator from "validator";

const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        // Escape HTML-tecken för att förhindra XSS
        return validator.escape(input);
    }
    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
};

const xssProtection = (req, res, next) => {
    // 1. Sanitera body (där user input kommer från)
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }

    // 2. Sanitera query params (med Object.defineProperty)
    if (req.query && Object.keys(req.query).length > 0) {
        const sanitizedQuery = sanitizeInput(req.query);
        Object.defineProperty(req, 'query', {
            value: sanitizedQuery,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }

    // 3. Sanitera URL params (med Object.defineProperty)
    if (req.params && Object.keys(req.params).length > 0) {
        const sanitizedParams = sanitizeInput(req.params);
        Object.defineProperty(req, 'params', {
            value: sanitizedParams,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }

    next();
};

export default xssProtection;