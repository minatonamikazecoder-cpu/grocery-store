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
        const errorMessage = error.errors?.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
        throw new ApiError(400, errorMessage || "Validation Error");
    }
};

module.exports = validate;
