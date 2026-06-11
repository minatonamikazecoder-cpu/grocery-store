const { z } = require("zod");

const createProductSchema = z.object({
    body: z.object({
        categoryId: z.string().min(1, "Category ID is required"),
        productName: z.string().min(1, "Product name is required"),
        description: z.string().min(1, "Description is required"),
        salePrice: z.string().or(z.number()).transform(val => Number(val)),
        costPrice: z.string().or(z.number()).transform(val => Number(val)),
        discount: z.string().or(z.number()).transform(val => Number(val)).optional().default(0),
        stock: z.string().or(z.number()).transform(val => Number(val)).optional().default(0),
        isActive: z.string().or(z.boolean()).transform(val => val === "true" || val === true).optional().default(true),
    }),
});

module.exports = {
    createProductSchema,
};
