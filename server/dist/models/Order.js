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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Address_1 = require("./Address");
const Offer_1 = require("./Offer");
const OrderItem_1 = require("./OrderItem");
const decimalTransformer_1 = require("./decimalTransformer");
let Order = class Order {
    id;
    userId;
    user;
    orderDate;
    orderStatus;
    delAddressId;
    delAddress;
    shippingCharge;
    total;
    paymentMode;
    paymentStatus;
    isDeleted;
    offerId;
    offer;
    razorpayOrderId;
    razorpayPaymentId;
    items;
    createdAt;
    updatedAt;
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], Order.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.orders, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Order.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        default: "Pending"
    }),
    __metadata("design:type", String)
], Order.prototype, "orderStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], Order.prototype, "delAddressId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address_1.Address),
    (0, typeorm_1.JoinColumn)({ name: "delAddressId" }),
    __metadata("design:type", Address_1.Address)
], Order.prototype, "delAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
        transformer: decimalTransformer_1.decimalTransformer
    }),
    __metadata("design:type", Number)
], Order.prototype, "shippingCharge", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
        transformer: decimalTransformer_1.decimalTransformer
    }),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "Cash on Delivery" }),
    __metadata("design:type", String)
], Order.prototype, "paymentMode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        default: "Pending"
    }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Order.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true, default: null }),
    __metadata("design:type", Object)
], Order.prototype, "offerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Offer_1.Offer, (offer) => offer.orders, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "offerId" }),
    __metadata("design:type", Object)
], Order.prototype, "offer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], Order.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], Order.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem_1.OrderItem, (item) => item.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
