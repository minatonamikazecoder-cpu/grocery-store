"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const typeorm_1 = require("typeorm");
const decimalTransformer_1 = require("./decimalTransformer");
const Order_1 = require("./Order");
let Offer = class Offer {
    id;
    offerCode;
    offerDescription;
    discount;
    maxDiscount;
    minimumOrder;
    startDate;
    endDate;
    orders;
};
exports.Offer = Offer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Offer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar" }),
    __metadata("design:type", String)
], Offer.prototype, "offerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Offer.prototype, "offerDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: decimalTransformer_1.decimalTransformer
    }),
    __metadata("design:type", Number)
], Offer.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: decimalTransformer_1.decimalTransformer
    }),
    __metadata("design:type", Number)
], Offer.prototype, "maxDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        transformer: decimalTransformer_1.decimalTransformer
    }),
    __metadata("design:type", Number)
], Offer.prototype, "minimumOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Offer.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Offer.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order_1.Order, (order) => order.offer),
    __metadata("design:type", Array)
], Offer.prototype, "orders", void 0);
exports.Offer = Offer = __decorate([
    (0, typeorm_1.Entity)()
], Offer);
