// Fully offline demo backend. No network calls at all — everything lives in memory for the
// life of the app session, seeded with realistic GVR Mart data so every screen has something
// real to show. Built so a friend can install the APK on a phone with zero connectivity and
// still click through the whole app.

import { ApiError } from './client';

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();

// ---------- Static catalogue (mirrors the real seed data) ----------

const categories = [
  { id: 'cat-fruits', name: 'Fruits', imageUrl: null },
  { id: 'cat-veg', name: 'Vegetables', imageUrl: null },
  { id: 'cat-leafy', name: 'Leafy Greens', imageUrl: null },
  { id: 'cat-exotic', name: 'Exotic', imageUrl: null },
  { id: 'cat-dry', name: 'Dry Fruits', imageUrl: null },
];

interface MockVariant {
  id: string;
  productId: string;
  label: string;
  unit: string;
  mrp: string;
  sellingPrice: string;
  stockQty: number;
  isActive: boolean;
}

interface MockProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  variants: MockVariant[];
}

function product(
  id: string,
  name: string,
  categoryId: string,
  imageUrl: string,
  variants: Array<[string, string, number, number, number]>,
  opts: { featured?: boolean; best?: boolean; description?: string } = {},
): MockProduct {
  return {
    id,
    name,
    description: opts.description ?? null,
    imageUrl,
    categoryId,
    isFeatured: !!opts.featured,
    isBestSeller: !!opts.best,
    rating: 4.5,
    variants: variants.map(([vid, label, mrp, price, stock]) => ({
      id: vid,
      productId: id,
      label,
      unit: label,
      mrp: String(mrp),
      sellingPrice: String(price),
      stockQty: stock,
      isActive: true,
    })),
  };
}

const products: MockProduct[] = [
  product(
    'p-strawberry',
    'Fresh Strawberry',
    'cat-fruits',
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&q=75&auto=format',
    [['v-strawberry-250', '250g Pack', 100, 80, 52]],
    { featured: true, description: 'Sweet, farm-picked strawberries delivered same day.' },
  ),
  product(
    'p-cauliflower',
    'Fresh Cauliflower',
    'cat-veg',
    'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=400&q=75&auto=format',
    [['v-cauliflower-1', '1 pc, ~600g', 45, 35, 80]],
  ),
  product(
    'p-lemon',
    'Yellow Lemon',
    'cat-fruits',
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=75&auto=format',
    [
      ['v-lemon-500', '500g Pack', 40, 28, 99],
      ['v-lemon-1kg', '1 kg', 75, 52, 40],
    ],
  ),
  product(
    'p-tomato',
    'Farm Tomato',
    'cat-veg',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=75&auto=format',
    [
      ['v-tomato-1', '1 kg', 38, 32, 150],
      ['v-tomato-5', '5 kg', 180, 150, 50],
      ['v-tomato-10', '10 kg', 350, 290, 25],
    ],
    { featured: true },
  ),
  product(
    'p-spinach',
    'Organic Spinach',
    'cat-leafy',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=75&auto=format',
    [['v-spinach-250', '250g Bunch', 28, 22, 70]],
  ),
  product(
    'p-carrot',
    'Sweet Carrot',
    'cat-veg',
    'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=75&auto=format',
    [
      ['v-carrot-500', '500g', 36, 30, 90],
      ['v-carrot-15', '15 kg', 480, 400, 20],
    ],
  ),
  product(
    'p-mango',
    'Alphonso Mango',
    'cat-exotic',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=75&auto=format',
    [['v-mango-1', '1 kg', 220, 180, 45]],
    { featured: true, best: true, description: 'The king of mangoes — naturally ripened, no chemicals.' },
  ),
  product(
    'p-grapes',
    'Fresh Grapes',
    'cat-fruits',
    'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=400&q=75&auto=format',
    [['v-grapes-500', '500g Pack', 75, 60, 65]],
  ),
  product(
    'p-almonds',
    'Premium Almonds',
    'cat-dry',
    'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=75&auto=format',
    [['v-almonds-250', '250g Pack', 320, 275, 40]],
    { best: true },
  ),
  product(
    'p-onion',
    'Green Onion',
    'cat-leafy',
    'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&q=75&auto=format',
    [['v-onion-1', '1 kg', 45, 36, 100]],
  ),
];

function findVariant(variantId: string) {
  for (const p of products) {
    const v = p.variants.find((v) => v.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return null;
}

// ---------- Mutable in-memory state ----------

interface StoredAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface StoredOrderItem {
  id: string;
  variantId: string;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
}

interface StoredOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  discount: string;
  deliveryFee: string;
  total: string;
  isBulk: boolean;
  placedAt: string;
  deliveredAt: string | null;
  items: StoredOrderItem[];
  address?: StoredAddress;
  delivery: { id: string; deliveryPartnerId: string | null; deliveredAt: string | null };
}

const seededAddress: StoredAddress = {
  id: 'addr-demo-home',
  label: 'Home',
  line1: '42 Besant Nagar 3rd Street',
  line2: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600090',
  isDefault: true,
};

const seededDeliveredOrder: StoredOrder = {
  id: 'order-demo-1',
  orderNumber: 'GVRDEMO001',
  status: 'DELIVERED',
  subtotal: '270',
  discount: '0',
  deliveryFee: '0',
  total: '270',
  isBulk: false,
  placedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  deliveredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
  items: [
    { id: uid('oi'), variantId: 'v-mango-1', productNameSnapshot: 'Alphonso Mango', variantLabelSnapshot: '1 kg', unitPriceSnapshot: '180', quantity: 1, lineTotal: '180' },
    { id: uid('oi'), variantId: 'v-grapes-500', productNameSnapshot: 'Fresh Grapes', variantLabelSnapshot: '500g Pack', unitPriceSnapshot: '60', quantity: 1, lineTotal: '60' },
    { id: uid('oi'), variantId: 'v-lemon-500', productNameSnapshot: 'Yellow Lemon', variantLabelSnapshot: '500g Pack', unitPriceSnapshot: '28', quantity: 1, lineTotal: '28' },
  ],
  address: seededAddress,
  delivery: { id: uid('del'), deliveryPartnerId: 'demo-partner', deliveredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString() },
};

const state = {
  user: null as null | { id: string; phone: string; role: 'CONSUMER'; name: string | null },
  addresses: [seededAddress] as StoredAddress[],
  cart: {} as Record<string, number>, // variantId -> qty
  orders: [seededDeliveredOrder] as StoredOrder[],
  notifications: [
    { id: uid('ntf'), type: 'PROMO', title: 'Welcome to GVR Mart!', body: 'Get ₹100 off your first order with code WELCOME100.', isRead: false, createdAt: nowIso() },
    { id: uid('ntf'), type: 'ORDER', title: 'Order GVRDEMO001 delivered', body: 'Your order has been delivered. Thanks for shopping with GVR Mart!', isRead: true, createdAt: seededDeliveredOrder.deliveredAt! },
  ] as { id: string; type: 'ORDER' | 'BULK' | 'PROMO' | 'SYSTEM'; title: string; body: string; isRead: boolean; createdAt: string }[],
  bulkEnquiryId: 'bulk-demo-1',
  quotationId: 'quote-demo-1',
  quotationStatus: 'SENT' as 'SENT' | 'ACCEPTED' | 'REJECTED',
};

const demoBulkEnquiry = {
  id: state.bulkEnquiryId,
  contactName: 'Demo Caterers',
  contactPhone: '+919876500000',
  preferredDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
  deliveryLocation: 'ITC Grand Chola, Chennai',
  notes: 'For a 300-guest event',
  status: 'QUOTED',
  items: [
    {
      id: uid('bei'),
      variantId: 'v-mango-1',
      requestedQty: 30,
      variant: { ...findVariant('v-mango-1')!.variant, product: findVariant('v-mango-1')!.product },
    },
  ],
  quotations: [
    {
      id: state.quotationId,
      version: 1,
      deliveryCharge: '400',
      notes: 'Bulk rate applied for your event.',
      status: state.quotationStatus,
      totalAmount: '5800',
      items: [
        {
          id: uid('qi'),
          variantId: 'v-mango-1',
          quantity: 30,
          unitPrice: '180',
          discount: '200',
          lineTotal: '5400',
        },
      ],
    },
  ],
};

function ensureUser(phone: string) {
  if (!state.user || state.user.phone !== phone) {
    state.user = { id: uid('user'), phone, role: 'CONSUMER', name: null };
  }
  return state.user;
}

function computeCart() {
  const items = Object.entries(state.cart).map(([variantId, quantity]) => {
    const found = findVariant(variantId)!;
    return {
      id: uid('ci'),
      variantId,
      quantity,
      variant: { ...found.variant, product: found.product },
    };
  });
  const subtotal = items.reduce((s, i) => s + Number(i.variant.sellingPrice) * i.quantity, 0);
  return { id: 'cart-demo', items, subtotal, itemCount: items.reduce((s, i) => s + i.quantity, 0) };
}

// ---------- Router ----------

function ok<T>(body: T) {
  return body;
}
function fail(status: number, message: string): never {
  throw new ApiError(status, [message]);
}

export async function mockRequest<T>(method: string, path: string, bodyRaw?: string): Promise<T> {
  await delay();
  const body = bodyRaw ? JSON.parse(bodyRaw) : undefined;
  const m = (re: RegExp) => path.match(re);

  // --- Auth ---
  if (method === 'POST' && path === '/auth/send-otp') {
    return ok({ success: true, phone: body.phone, expiresInMinutes: 5, devOtp: '1234' }) as T;
  }
  if (method === 'POST' && path === '/auth/verify-otp') {
    const user = ensureUser(body.phone);
    return ok({
      accessToken: 'offline-demo-token',
      refreshToken: 'offline-demo-refresh',
      user: { id: user.id, phone: user.phone, role: user.role, name: user.name },
    }) as T;
  }
  if (method === 'POST' && path === '/auth/refresh') {
    return ok({ accessToken: 'offline-demo-token' }) as T;
  }

  // --- Users ---
  if (method === 'GET' && path === '/users/me') {
    return ok({ ...state.user, customerProfile: { name: state.user?.name, email: null }, addresses: state.addresses }) as T;
  }
  if (method === 'PATCH' && path === '/users/me') {
    if (state.user) state.user.name = body.name ?? state.user.name;
    return ok({ success: true }) as T;
  }
  if (method === 'GET' && path === '/users/me/addresses') {
    return ok(state.addresses) as T;
  }
  if (method === 'POST' && path === '/users/me/addresses') {
    const addr: StoredAddress = { id: uid('addr'), isDefault: state.addresses.length === 0, ...body };
    if (addr.isDefault) state.addresses.forEach((a) => (a.isDefault = false));
    state.addresses.push(addr);
    return ok(addr) as T;
  }
  const addrMatch = m(/^\/users\/me\/addresses\/([^/]+)$/);
  if (addrMatch && method === 'PATCH') {
    const addr = state.addresses.find((a) => a.id === addrMatch[1]);
    if (!addr) fail(404, 'Address not found');
    if (body.isDefault) state.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(addr!, body);
    return ok(addr) as T;
  }
  if (addrMatch && method === 'DELETE') {
    state.addresses = state.addresses.filter((a) => a.id !== addrMatch[1]);
    return ok({ success: true }) as T;
  }

  // --- Catalogue ---
  if (method === 'GET' && path === '/categories') {
    return ok(categories.map((c) => ({ ...c, children: [] }))) as T;
  }
  if (method === 'GET' && path.startsWith('/products?')) {
    const params = new URLSearchParams(path.split('?')[1]);
    let list = [...products];
    const category = params.get('category');
    const search = params.get('search');
    const featuredOnly = params.get('featuredOnly');
    if (category) list = list.filter((p) => p.categoryId === category);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (featuredOnly === 'true') list = list.filter((p) => p.isFeatured);
    return ok(list) as T;
  }
  if (method === 'GET' && path === '/products') {
    return ok(products) as T;
  }
  const productMatch = m(/^\/products\/([^/]+)$/);
  if (productMatch && method === 'GET') {
    const found = products.find((p) => p.id === productMatch[1]);
    if (!found) fail(404, 'Product not found');
    return ok(found) as T;
  }

  // --- Cart ---
  if (method === 'GET' && path === '/cart') {
    return ok(computeCart()) as T;
  }
  if (method === 'POST' && path === '/cart/items') {
    state.cart[body.variantId] = (state.cart[body.variantId] ?? 0) + (body.quantity ?? 1);
    return ok(computeCart()) as T;
  }
  const cartItemMatch = m(/^\/cart\/items\/([^/]+)$/);
  if (cartItemMatch && method === 'PATCH') {
    if (body.quantity <= 0) delete state.cart[cartItemMatch[1]];
    else state.cart[cartItemMatch[1]] = body.quantity;
    return ok(computeCart()) as T;
  }
  if (cartItemMatch && method === 'DELETE') {
    delete state.cart[cartItemMatch[1]];
    return ok(computeCart()) as T;
  }

  // --- Orders ---
  if (method === 'POST' && path === '/orders') {
    const cart = computeCart();
    if (cart.items.length === 0) fail(400, 'Your cart is empty');
    const address = state.addresses.find((a) => a.id === body.addressId);
    if (!address) fail(404, 'Address not found');
    let discount = 0;
    if (body.couponCode) {
      if (body.couponCode.toUpperCase() !== 'WELCOME100') fail(400, 'Invalid coupon code');
      if (cart.subtotal < 300) fail(400, 'Minimum order value for this coupon is ₹300');
      discount = 100;
    }
    const deliveryFee = cart.subtotal - discount >= 500 ? 0 : 30;
    const total = cart.subtotal - discount + deliveryFee;
    const order: StoredOrder = {
      id: uid('order'),
      orderNumber: `GVR${Date.now().toString(36).toUpperCase()}`,
      status: 'PLACED',
      subtotal: String(cart.subtotal),
      discount: String(discount),
      deliveryFee: String(deliveryFee),
      total: String(total),
      isBulk: false,
      placedAt: nowIso(),
      deliveredAt: null,
      items: cart.items.map((i) => ({
        id: uid('oi'),
        variantId: i.variantId,
        productNameSnapshot: i.variant.product.name,
        variantLabelSnapshot: i.variant.label,
        unitPriceSnapshot: i.variant.sellingPrice,
        quantity: i.quantity,
        lineTotal: String(Number(i.variant.sellingPrice) * i.quantity),
      })),
      address,
      delivery: { id: uid('del'), deliveryPartnerId: null, deliveredAt: null },
    };
    state.orders.unshift(order);
    state.cart = {};
    state.notifications.unshift({
      id: uid('ntf'),
      type: 'ORDER',
      title: 'Order placed',
      body: `Your order ${order.orderNumber} for ₹${total} has been placed.`,
      isRead: false,
      createdAt: nowIso(),
    });
    return ok(order) as T;
  }
  if (method === 'GET' && path === '/orders/mine') {
    return ok(state.orders) as T;
  }
  const orderMatch = m(/^\/orders\/([^/]+)$/);
  if (orderMatch && method === 'GET') {
    const order = state.orders.find((o) => o.id === orderMatch[1]);
    if (!order) fail(404, 'Order not found');
    return ok(order) as T;
  }
  const orderCancelMatch = m(/^\/orders\/([^/]+)\/cancel$/);
  if (orderCancelMatch && method === 'PATCH') {
    const order = state.orders.find((o) => o.id === orderCancelMatch[1]);
    if (!order) fail(404, 'Order not found');
    order!.status = 'CANCELLED';
    return ok(order) as T;
  }
  const reorderMatch = m(/^\/orders\/([^/]+)\/reorder$/);
  if (reorderMatch && method === 'POST') {
    const order = state.orders.find((o) => o.id === reorderMatch[1]);
    if (!order) fail(404, 'Order not found');
    for (const item of order!.items) {
      if (findVariant(item.variantId)) {
        state.cart[item.variantId] = (state.cart[item.variantId] ?? 0) + item.quantity;
      }
    }
    return ok(computeCart()) as T;
  }

  // --- Bulk ---
  if (method === 'POST' && path === '/bulk/enquiries') {
    state.notifications.unshift({
      id: uid('ntf'),
      type: 'BULK',
      title: 'Bulk enquiry submitted',
      body: 'Our team will review your request and send a quotation soon.',
      isRead: false,
      createdAt: nowIso(),
    });
    return ok({ id: uid('bulk'), status: 'NEW' }) as T;
  }
  if (method === 'GET' && path === '/bulk/enquiries/mine') {
    return ok([demoBulkEnquiry]) as T;
  }
  const bulkGetMatch = m(/^\/bulk\/enquiries\/([^/]+)$/);
  if (bulkGetMatch && method === 'GET') {
    if (bulkGetMatch[1] !== state.bulkEnquiryId) fail(404, 'Enquiry not found');
    return ok(demoBulkEnquiry) as T;
  }
  const quoteRespondMatch = m(/^\/bulk\/quotations\/([^/]+)\/respond$/);
  if (quoteRespondMatch && method === 'PATCH') {
    if (quoteRespondMatch[1] !== state.quotationId) fail(404, 'Quotation not found');
    if (body.action === 'REJECT') {
      state.quotationStatus = 'REJECTED';
      demoBulkEnquiry.quotations[0].status = 'REJECTED';
      demoBulkEnquiry.status = 'REJECTED';
      return ok({ status: 'REJECTED' }) as T;
    }
    state.quotationStatus = 'ACCEPTED';
    demoBulkEnquiry.quotations[0].status = 'ACCEPTED';
    demoBulkEnquiry.status = 'CONVERTED';
    const order: StoredOrder = {
      id: uid('order'),
      orderNumber: `GVRB${Date.now().toString(36).toUpperCase()}`,
      status: 'PLACED',
      subtotal: '5400',
      discount: '0',
      deliveryFee: '400',
      total: '5800',
      isBulk: true,
      placedAt: nowIso(),
      deliveredAt: null,
      items: [
        { id: uid('oi'), variantId: 'v-mango-1', productNameSnapshot: 'Alphonso Mango', variantLabelSnapshot: '1 kg', unitPriceSnapshot: '180', quantity: 30, lineTotal: '5400' },
      ],
      address: state.addresses[0],
      delivery: { id: uid('del'), deliveryPartnerId: null, deliveredAt: null },
    };
    state.orders.unshift(order);
    return ok({ status: 'ACCEPTED', order }) as T;
  }

  // --- Notifications ---
  if (method === 'GET' && path === '/notifications') {
    return ok(state.notifications) as T;
  }
  const notifReadMatch = m(/^\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === 'PATCH') {
    const n = state.notifications.find((n) => n.id === notifReadMatch[1]);
    if (n) n.isRead = true;
    return ok({ success: true }) as T;
  }
  if (method === 'PATCH' && path === '/notifications/read-all') {
    state.notifications.forEach((n) => (n.isRead = true));
    return ok({ success: true }) as T;
  }

  fail(404, `Offline demo: no mock handler for ${method} ${path}`);
}
