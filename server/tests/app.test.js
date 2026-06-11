const request = require("supertest");
const express = require("express");
const app = express();

app.get("/test", (req, res) => {
    res.status(200).json({ success: true });
});

describe("GET /test", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/test");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
