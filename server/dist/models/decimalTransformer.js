"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalTransformer = void 0;
exports.decimalTransformer = {
    to: (value) => value,
    from: (value) => {
        if (value === null || value === undefined)
            return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? value : parsed;
    }
};
