import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Offer } from "../models/Offer";
import { In } from "typeorm";

const isActive = (start: Date, end: Date) => {
  const now = new Date();
  return new Date(start) <= now && now <= new Date(end);
};

// Check stock availability based on userId
export const checkStockAvailability = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const customReq = req as any;

  if (customReq.user.id !== userId) {
    throw new ApiError(403, "Unauthorized access");
  }

  const cart = await AppDataSource.getRepository(Cart).findOne({
    where: { userId },
    relations: { items: { product: true } },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty or not found.");
  }

  for (const item of cart.items) {
    const product = item.product;
    if (!product || (product.stock || 0) < item.quantity) {
      throw new ApiError(
        400,
        `${product ? product.productName : "Product"}'s ${item.quantity} quantity is not available in stock.`
      );
    }
  }

  res.status(200).json(new ApiResponse(200, null, "All products are available in sufficient quantity.").toJSON());
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    addressId,
    promoCodeId,
    razorpayOrderId,
    razorpayPaymentId,
  } = req.body;
  const customReq = req as any;

  if (customReq.user.id !== userId) {
    throw new ApiError(403, "Unauthorized access");
  }

  // Retrieve cart
  const cart = await AppDataSource.getRepository(Cart).findOne({
    where: { userId },
    relations: { items: { product: true } },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty or not found.");
  }

  // Calculate subtotal
  let subtotal = 0;
  cart.items.forEach((item) => {
    const salePrice = item.product.salePrice;
    const discount = item.product.discount || 0;
    subtotal += (salePrice - (salePrice * discount) / 100) * item.quantity;
  });

  // Calculate offer discount
  let discountAmount = 0;
  const discountPerProduct: Record<string, number> = {};
  if (promoCodeId) {
    const offer = await AppDataSource.getRepository(Offer).findOneBy({ id: promoCodeId });
    if (!offer || !isActive(offer.startDate, offer.endDate)) {
      throw new ApiError(400, "Invalid or inactive promo code.");
    }

    if (subtotal >= offer.minimumOrder) {
      const rawDiscount = subtotal * (offer.discount / 100);
      discountAmount = Math.min(rawDiscount, offer.maxDiscount);

      // Distribute discount proportionally
      const totalBase = subtotal;
      cart.items.forEach((item) => {
        const salePrice = item.product.salePrice;
        const discount = item.product.discount || 0;
        const productTotal = (salePrice - (salePrice * discount) / 100) * item.quantity;
        const productDiscount = totalBase > 0 ? (productTotal / totalBase) * discountAmount : 0;
        discountPerProduct[item.productId] = productDiscount;
      });
    }
  }

  const shippingCharge = 50;
  const totalAmount = subtotal - discountAmount + shippingCharge;

  // Use Database Transactions
  const result = await AppDataSource.transaction(async (transactionalEntityManager) => {
    const orderRepository = transactionalEntityManager.getRepository(Order);
    const orderItemRepository = transactionalEntityManager.getRepository(OrderItem);
    const productRepository = transactionalEntityManager.getRepository(Product);
    const cartItemRepository = transactionalEntityManager.getRepository(CartItem);

    // Recheck and lock/validate stock inside transaction
    for (const item of cart.items) {
      const product = await productRepository.findOneBy({ id: item.productId });
      if (!product || (product.stock || 0) < item.quantity) {
        throw new ApiError(
          400,
          `${product ? product.productName : "Product"}'s ${item.quantity} quantity is not available in stock.`
        );
      }
    }

    // Create Order
    const newOrder = orderRepository.create({
      userId,
      delAddressId: addressId,
      orderDate: new Date(),
      orderStatus: "Pending",
      shippingCharge,
      total: totalAmount,
      paymentMode: "Online",
      paymentStatus: "Completed",
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      offerId: promoCodeId || null,
    });

    const savedOrder = await orderRepository.save(newOrder);

    // Create OrderItems
    const orderItems = cart.items.map((item) => {
      const productId = item.productId;
      const quantity = item.quantity;
      const salePrice = item.product.salePrice;
      const discount = item.product.discount || 0;
      const price = salePrice - (salePrice * discount) / 100;
      const distDiscount = discountPerProduct[productId] || 0;

      return orderItemRepository.create({
        orderId: savedOrder.id,
        productId,
        quantity,
        price,
        discount: distDiscount,
      });
    });

    await orderItemRepository.save(orderItems);

    // Decrease stock on each product
    for (const item of cart.items) {
      const product = await productRepository.findOneBy({ id: item.productId });
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        await productRepository.save(product);
      }
    }

    // Delete CartItems for the user's cart
    await cartItemRepository.delete({ cartId: cart.id });

    return savedOrder;
  });

  res.status(201).json(new ApiResponse(201, result, "Checkout completed successfully.").toJSON());
});

// Add a new order with multiple products
export const addOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    orderDate,
    orderStatus,
    delAddressId,
    shippingCharge,
    products,
    paymentMode,
  } = req.body;
  const customReq = req as any;

  if (customReq.user.id !== userId && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  // Validate if products are provided
  if (!products || products.length === 0) {
    throw new ApiError(400, "At least one product is required.");
  }

  const productRepository = AppDataSource.getRepository(Product);

  // Calculate the total order price
  let totalAmount = 0;
  for (const product of products) {
    const { productId, quantity } = product;
    const foundProduct = await productRepository.findOneBy({ id: productId });

    if (!foundProduct) {
      throw new ApiError(400, `Product with id ${productId} not found.`);
    }

    const salePrice = foundProduct.salePrice;
    const discount = foundProduct.discount || 0;
    totalAmount += (salePrice - (salePrice * discount) / 100) * quantity;
  }

  const orderRepository = AppDataSource.getRepository(Order);

  // Create the order
  const newOrder = orderRepository.create({
    userId,
    orderDate: orderDate ? new Date(orderDate) : new Date(),
    orderStatus: orderStatus || "Pending",
    delAddressId,
    shippingCharge: parseFloat(shippingCharge) || 0,
    total: totalAmount + (parseFloat(shippingCharge) || 0),
    paymentMode: paymentMode || "Cash on Delivery",
    paymentStatus: "Pending",
  });

  // Save the order
  const savedOrder = await orderRepository.save(newOrder);

  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  // Create order items for each product
  const orderItems = await Promise.all(
    products.map(async (product: any) => {
      const foundProduct = await productRepository.findOneBy({ id: product.productId });
      return orderItemRepository.create({
        orderId: savedOrder.id,
        productId: product.productId,
        quantity: product.quantity,
        price: foundProduct!.salePrice,
        discount: foundProduct!.discount || 0,
      });
    })
  );

  // Save order items
  await orderItemRepository.save(orderItems);

  res.status(201).json(new ApiResponse(201, savedOrder, "Order created successfully.").toJSON());
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    orderDate,
    orderStatus,
    delAddressId,
    shippingCharge,
    products,
    paymentMode,
  } = req.body;
  const orderId = req.params.orderId as string;
  const customReq = req as any;

  const orderRepository = AppDataSource.getRepository(Order);

  // Validate order existence
  const existingOrder = await orderRepository.findOneBy({ id: orderId });
  if (!existingOrder) {
    throw new ApiError(404, "Order not found.");
  }

  if (existingOrder.userId !== customReq.user.id && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  // Validate products
  if (!products || products.length === 0) {
    throw new ApiError(400, "At least one product is required.");
  }

  const productRepository = AppDataSource.getRepository(Product);

  // Calculate new total amount
  let totalAmount = 0;
  for (const product of products) {
    const { productId, quantity } = product;
    const foundProduct = await productRepository.findOneBy({ id: productId });
    if (!foundProduct) {
      throw new ApiError(400, `Product with id ${productId} not found.`);
    }

    const salePrice = foundProduct.salePrice;
    const discount = foundProduct.discount || 0;
    totalAmount += (salePrice - (salePrice * discount) / 100) * quantity;
  }

  // Update order details
  existingOrder.userId = userId;
  existingOrder.orderDate = orderDate ? new Date(orderDate) : existingOrder.orderDate;
  existingOrder.orderStatus = orderStatus || existingOrder.orderStatus;
  existingOrder.delAddressId = delAddressId;
  existingOrder.shippingCharge = parseFloat(shippingCharge) || 0;
  existingOrder.total = totalAmount + (parseFloat(shippingCharge) || 0);
  existingOrder.paymentMode = paymentMode || existingOrder.paymentMode;

  const updatedOrder = await orderRepository.save(existingOrder);

  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  // Delete old order items
  await orderItemRepository.delete({ orderId });

  // Create new order items
  const orderItems = await Promise.all(
    products.map(async (product: any) => {
      const foundProduct = await productRepository.findOneBy({ id: product.productId });
      return orderItemRepository.create({
        orderId: updatedOrder.id,
        productId: product.productId,
        quantity: product.quantity,
        price: foundProduct!.salePrice,
        discount: foundProduct!.discount || 0,
      });
    })
  );

  await orderItemRepository.save(orderItems);

  res.status(200).json(new ApiResponse(200, updatedOrder, "Order updated successfully.").toJSON());
});

// Fetch multiple orders (supporting filtering by deleted status) with pagination
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { includeDeleted = "false", page = 1, limit = 10 } = req.query;

  const parsedPage = Math.max(1, parseInt(page as string) || 1);
  const parsedLimit = Math.max(1, parseInt(limit as string) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const where: any = includeDeleted === "true" ? {} : { isDeleted: false };

  const orderRepository = AppDataSource.getRepository(Order);

  const [results, total] = await orderRepository.findAndCount({
    where,
    relations: { user: true, delAddress: true, offer: true, items: { product: true } },
    skip,
    take: parsedLimit,
    order: {
      createdAt: "DESC",
    },
  });

  res.status(200).json(
    new ApiResponse(200, results, "Orders fetched successfully", {
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    }).toJSON()
  );
});

// Mark an order as deleted (soft delete)
export const markOrderAsDeleted = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const customReq = req as any;

  const orderRepository = AppDataSource.getRepository(Order);
  const order = await orderRepository.findOneBy({ id: orderId });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.userId !== customReq.user.id && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  order.isDeleted = true;
  await orderRepository.save(order);

  res.status(200).json(new ApiResponse(200, null, "Order marked as deleted.").toJSON());
});

// Fetch only non-deleted orders
export const getActiveOrders = asyncHandler(async (req: Request, res: Response) => {
  const orderRepository = AppDataSource.getRepository(Order);
  const activeOrders = await orderRepository.find({
    where: { isDeleted: false },
    relations: { user: true, delAddress: true },
  });

  const formattedOrders = activeOrders.map(order => ({
    ...order,
    _id: order.id,
    userId: order.user ? {
      ...order.user,
      _id: order.user.id
    } : null,
    delAddressId: order.delAddress ? {
      ...order.delAddress,
      _id: order.delAddress.id
    } : null
  }));

  res.status(200).json(new ApiResponse(200, formattedOrders, "Active orders fetched successfully").toJSON());
});

// Fetch a single order by ID (include products and address)
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const customReq = req as any;

  const orderRepository = AppDataSource.getRepository(Order);

  // Fetch the order and populate necessary fields
  const order = await orderRepository.findOne({
    where: { id: orderId },
    relations: { user: true, delAddress: true, offer: true },
  });

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.userId !== customReq.user.id && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  // Fetch all OrderItems related to this order and populate product details
  const orderItems = await orderItemRepository.find({
    where: { orderId },
    relations: { product: true },
  });

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(404, "No order items found.");
  }

  // Format orderItems exactly as expected
  const formattedOrderItems = orderItems.map((item) => ({
    productId: item.product
      ? {
          id: item.product.id,
          _id: item.product.id,
          productName: item.product.productName,
          productImage: item.product.productImage,
        }
      : null,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
  }));

  const formattedOrder = {
    ...order,
    _id: order.id,
    delAddressId: order.delAddress ? {
      ...order.delAddress,
      _id: order.delAddress.id
    } : null,
    userId: order.user ? {
      ...order.user,
      _id: order.user.id
    } : null
  };

  res.status(200).json(new ApiResponse(200, { order: formattedOrder, orderItems: formattedOrderItems }, "Order details fetched successfully").toJSON());
});

export const hasUserPurchasedProduct = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const productId = req.params.productId as string;

  const orderRepository = AppDataSource.getRepository(Order);

  // Find all non-deleted orders by the user
  const userOrders = await orderRepository.find({
    where: { userId, isDeleted: false },
    select: { id: true },
  });

  const orderIds = userOrders.map((order) => order.id);

  if (orderIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, { purchased: false }, "User has not purchased product").toJSON());
  }

  const orderItemRepository = AppDataSource.getRepository(OrderItem);

  // Check if any order items match the productId and belong to those orders
  const orderItem = await orderItemRepository.findOne({
    where: {
      orderId: In(orderIds),
      productId,
    },
  });

  const hasPurchased = !!orderItem;

  res.status(200).json(new ApiResponse(200, { purchased: hasPurchased }, "Purchase check completed").toJSON());
});

export const getOrdersByUserId = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const customReq = req as any;

  if (customReq.user.id !== userId && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const orderRepository = AppDataSource.getRepository(Order);

  const orders = await orderRepository.find({
    where: { userId, isDeleted: false },
    relations: { delAddress: true },
    order: { orderDate: "DESC" },
  });

  const formattedOrders = orders.map(order => ({
    ...order,
    _id: order.id,
    delAddressId: order.delAddress ? {
      ...order.delAddress,
      _id: order.delAddress.id
    } : null
  }));

  res.status(200).json(new ApiResponse(200, formattedOrders, "User orders fetched successfully").toJSON());
});
