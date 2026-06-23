export interface User {
  id: string;
  _id?: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  mobile: string | null;
  profilePicture: string | null;
  role: string;
  status: string;
  authType: string;
  createdAt: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  color: string;
  image: string;
  isDeleted: boolean;
}

export interface Product {
  id: string;
  _id?: string;
  categoryId: any; // Can be string or Category object
  productName: string;
  description: string;
  productImage: string;
  salePrice: number;
  costPrice: number;
  discount: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
  category?: Category;
}

export interface CartItem {
  id: string;
  _id?: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  _id?: string;
  userId: string;
  items: CartItem[];
}

export interface WishlistItem {
  id: string;
  _id?: string;
  wishlistId: string;
  productId: string;
  product?: Product;
}

export interface Wishlist {
  id: string;
  _id?: string;
  userId: string;
  items: WishlistItem[];
}

export interface Address {
  id: string;
  _id?: string;
  userId: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: number;
  phone: string;
}

export interface Offer {
  id: string;
  _id?: string;
  offerCode: string;
  offerDescription: string;
  discount: number;
  maxDiscount: number;
  minimumOrder: number;
  startDate: string;
  endDate: string;
}

export interface OrderItem {
  id: string;
  _id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  product?: Product;
}

export interface Order {
  id: string;
  _id?: string;
  userId: string;
  orderDate: string;
  orderStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  delAddressId: string;
  shippingCharge: number;
  total: number;
  paymentMode: string;
  paymentStatus: "Pending" | "Completed" | "Failed";
  isDeleted: boolean;
  offerId: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
  user?: User;
  delAddress?: Address;
  offer?: Offer;
}

export interface Review {
  id: string;
  _id?: string;
  productId: string;
  userId: string;
  rating: number;
  review: string;
  reviewDate: string;
  reply: string | null;
  replyDate: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  product?: Product;
}

export interface Banner {
  id: string;
  _id?: string;
  bannerImage: string;
  viewOrder: number;
  activeStatus: boolean;
  type: string;
}

export interface ContactPage {
  contactEmail: string;
  contactNumber: string;
}

export interface AboutPage {
  content: string;
}

export interface Response {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  reply: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
