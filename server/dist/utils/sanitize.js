"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHTML = void 0;
const sanitizeHTML = (str) => {
    if (typeof str !== 'string')
        return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};
exports.sanitizeHTML = sanitizeHTML;
