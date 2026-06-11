const { z } = require("zod");

const categorySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        color: z.string().min(1, "Color is required"),
    }),
});

module.exports = {
    categorySchema,
};
