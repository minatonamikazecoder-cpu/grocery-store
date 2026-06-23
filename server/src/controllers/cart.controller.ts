import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AppDataSource } from "../db/data-source";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";

const formatCart = (cart: Cart) => {
  return {
    id: cart.id,
    userId: cart.userId,
    items: (cart.items || []).map((item) => ({
      productId: item.product,
      quantity: item.quantity,
    })),
  };
};

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { userId, productId, quantity } = req.body;
  const customReq = req as any;

  if (customReq.user.id !== userId && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const cartRepository = AppDataSource.getRepository(Cart);
  const cartItemRepository = AppDataSource.getRepository(CartItem);

  let cart = await cartRepository.findOne({
    where: { userId },
    relations: { items: { product: true } },
  });

  if (!cart) {
    cart = cartRepository.create({ userId });
    cart = await cartRepository.save(cart);
  }

  let cartItem = await cartItemRepository.findOne({
    where: { cartId: cart.id, productId },
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItemRepository.save(cartItem);
  } else {
    cartItem = cartItemRepository.create({
      cartId: cart.id,
      productId,
      quantity,
    });
    await cartItemRepository.save(cartItem);
  }

  const updatedCart = await cartRepository.findOne({
    where: { userId },
    relations: { items: { product: true } },
  });

  res.status(201).json(new ApiResponse(201, formatCart(updatedCart!), "Item added to cart successfully").toJSON());
});

export const getCartByUserId = asyncHandler(async (req: Request, res: Response) => {
  const customReq = req as any;
  if (customReq.user.id !== (req.params.userId as string) && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const cartRepository = AppDataSource.getRepository(Cart);
  const cart = await cartRepository.findOne({
    where: { userId: req.params.userId as string },
    relations: { items: { product: true } },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  res.status(200).json(new ApiResponse(200, formatCart(cart), "Cart fetched successfully").toJSON());
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const customReq = req as any;
  if (customReq.user.id !== (req.params.userId as string) && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const { productId, quantity } = req.body;
  const cartRepository = AppDataSource.getRepository(Cart);
  const cart = await cartRepository.findOne({
    where: { userId: req.params.userId as string },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItemRepository = AppDataSource.getRepository(CartItem);
  const cartItem = await cartItemRepository.findOne({
    where: { cartId: cart.id, productId },
  });

  if (cartItem) {
    cartItem.quantity = quantity;
    await cartItemRepository.save(cartItem);

    const updatedCart = await cartRepository.findOne({
      where: { userId: req.params.userId as string },
      relations: { items: { product: true } },
    });

    res.status(200).json(new ApiResponse(200, formatCart(updatedCart!), "Cart item updated successfully").toJSON());
  } else {
    throw new ApiError(404, "Product not in cart");
  }
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  const customReq = req as any;
  if (customReq.user.id !== (req.params.userId as string) && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const { productId } = req.body;
  const cartRepository = AppDataSource.getRepository(Cart);
  const cart = await cartRepository.findOne({
    where: { userId: req.params.userId as string },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItemRepository = AppDataSource.getRepository(CartItem);
  const cartItem = await cartItemRepository.findOne({
    where: { cartId: cart.id, productId },
  });

  if (cartItem) {
    await cartItemRepository.remove(cartItem);

    const updatedCart = await cartRepository.findOne({
      where: { userId: req.params.userId as string },
      relations: { items: { product: true } },
    });

    res.status(200).json(new ApiResponse(200, formatCart(updatedCart!), "Cart item removed successfully").toJSON());
  } else {
    throw new ApiError(404, "Product not in cart");
  }
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const customReq = req as any;
  if (customReq.user.id !== (req.params.userId as string) && customReq.user.role !== "Admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const cartRepository = AppDataSource.getRepository(Cart);
  const cart = await cartRepository.findOne({
    where: { userId: req.params.userId as string },
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const cartItemRepository = AppDataSource.getRepository(CartItem);
  await cartItemRepository.delete({ cartId: cart.id });

  res.status(200).json(new ApiResponse(200, null, "Cart cleared successfully").toJSON());
});
