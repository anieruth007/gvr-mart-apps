export type Role = 'CONSUMER' | 'DELIVERY_PARTNER' | 'ADMIN';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'PACKED'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type BulkEnquiryStatus = 'NEW' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED' | 'CANCELLED';
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface AuthUser {
  id: string;
  phone: string;
  role: Role;
  name: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AddressDto {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  emoji?: string | null;
  imageUrl?: string | null;
}

export interface ProductVariantDto {
  id: string;
  productId: string;
  label: string;
  unit: string;
  mrp: string;
  sellingPrice: string;
  stockQty: number;
  isActive: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  variants: ProductVariantDto[];
}

export interface CartItemDto {
  id: string;
  variantId: string;
  quantity: number;
  variant: ProductVariantDto & { product: ProductDto };
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItemDto {
  id: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
}

export interface DeliveryDto {
  id: string;
  deliveryPartnerId?: string | null;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string;
  discount: string;
  deliveryFee: string;
  total: string;
  isBulk: boolean;
  placedAt: string;
  deliveredAt?: string | null;
  items: OrderItemDto[];
  delivery?: DeliveryDto | null;
  address?: AddressDto;
}

export interface NotificationDto {
  id: string;
  type: 'ORDER' | 'BULK' | 'PROMO' | 'SYSTEM';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface BulkEnquiryItemDto {
  id: string;
  variantId: string;
  requestedQty: number;
  variant: ProductVariantDto & { product: ProductDto };
}

export interface QuotationItemDto {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  lineTotal: string;
}

export interface QuotationDto {
  id: string;
  version: number;
  deliveryCharge: string;
  notes?: string | null;
  status: QuotationStatus;
  totalAmount: string;
  items: QuotationItemDto[];
}

export interface BulkEnquiryDto {
  id: string;
  contactName: string;
  contactPhone: string;
  preferredDate: string;
  deliveryLocation: string;
  notes?: string | null;
  status: BulkEnquiryStatus;
  items: BulkEnquiryItemDto[];
  quotations: QuotationDto[];
}
