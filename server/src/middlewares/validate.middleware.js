const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error.issues) {
            const errorMessage = error.issues.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
            throw new ApiError(400, errorMessage);
        }
        throw new ApiError(400, error.message || "Validation Error");
    }
};

module.exports = validate;
