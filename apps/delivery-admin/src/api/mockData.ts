// Fully offline demo backend for the Delivery & Management app. No network calls — everything
// is served from in-memory state seeded with realistic data. Role is picked by phone number,
// same numbers as the real backend's demo accounts: 9000000001 = Admin, anything else = Delivery
// Partner, so existing instructions still make sense.

import { ApiError } from './client';

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));
const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const nowIso = () => new Date().toISOString();

type Role = 'ADMIN' | 'DELIVERY_PARTNER';

const ADMIN_PHONES = ['+919000000001'];

interface StoredOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  discount: string;
  deliveryFee: string;
  total: string;
  isBulk: boolean;
  paymentStatus: string;
  items: { id: string; productNameSnapshot: string; variantLabelSnapshot: string; unitPriceSnapshot: string; quantity: number; lineTotal: string }[];
}

const orders: StoredOrder[] = [
  {
    id: 'order-1', orderNumber: 'GVRDEMO101', status: 'PLACED', subtotal: '198', discount: '0', deliveryFee: '30', total: '228', isBulk: false, paymentStatus: 'PENDING',
    items: [
      { id: uid('oi'), productNameSnapshot: 'Fresh Strawberry', variantLabelSnapshot: '250g Pack', unitPriceSnapshot: '80', quantity: 1, lineTotal: '80' },
      { id: uid('oi'), productNameSnapshot: 'Yellow Lemon', variantLabelSnapshot: '500g Pack', unitPriceSnapshot: '28', quantity: 1, lineTotal: '28' },
      { id: uid('oi'), productNameSnapshot: 'Fresh Grapes', variantLabelSnapshot: '500g Pack', unitPriceSnapshot: '60', quantity: 1, lineTotal: '60' },
    ],
  },
  {
    id: 'order-2', orderNumber: 'GVRDEMO102', status: 'PACKED', subtotal: '180', discount: '0', deliveryFee: '30', total: '210', isBulk: false, paymentStatus: 'PENDING',
    items: [{ id: uid('oi'), productNameSnapshot: 'Alphonso Mango', variantLabelSnapshot: '1 kg', unitPriceSnapshot: '180', quantity: 1, lineTotal: '180' }],
  },
  {
    id: 'order-3', orderNumber: 'GVRDEMO103', status: 'DELIVERED', subtotal: '350', discount: '0', deliveryFee: '0', total: '350', isBulk: false, paymentStatus: 'PAID',
    items: [{ id: uid('oi'), productNameSnapshot: 'Premium Almonds', variantLabelSnapshot: '250g Pack', unitPriceSnapshot: '275', quantity: 1, lineTotal: '275' }],
  },
  {
    id: 'order-4', orderNumber: 'GVRBDEMO201', status: 'ASSIGNED', subtotal: '5400', discount: '0', deliveryFee: '400', total: '5800', isBulk: true, paymentStatus: 'PENDING',
    items: [{ id: uid('oi'), productNameSnapshot: 'Alphonso Mango', variantLabelSnapshot: '1 kg', unitPriceSnapshot: '180', quantity: 30, lineTotal: '5400' }],
  },
];

const NEXT_STATUS: Record<string, string | undefined> = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PREPARING',
  PREPARING: 'PACKED',
};

const deliveryPartners = [
  { id: 'dp-karthik', phone: '+919123456789', isActive: true, name: 'Karthik', vehicleInfo: 'Bike TN-01', isOnline: true, deliveriesDone: 3 },
];

const customers = [
  { id: 'cust-1', phone: '+919876543210', isActive: true, name: null as string | null, orders: 2, bulkEnquiries: 0 },
  { id: 'cust-2', phone: '+919988776655', isActive: true, name: null as string | null, orders: 3, bulkEnquiries: 1 },
];

interface DemoBulkEnquiry {
  id: string;
  contactName: string;
  contactPhone: string;
  preferredDate: string;
  deliveryLocation: string;
  notes: string;
  status: string;
  items: { id: string; variantId: string; requestedQty: number; variant: { id: string; label: string; unit: string; sellingPrice: string; product: { name: string } } }[];
  quotations: any[];
}

const bulkEnquiries: DemoBulkEnquiry[] = [
  {
    id: 'bulk-1', contactName: 'Chennai Wedding Caterers', contactPhone: '+919988776655',
    preferredDate: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString(),
    deliveryLocation: 'ITC Grand Chola, Chennai', notes: 'For a 500-guest wedding reception', status: 'NEW',
    items: [{ id: uid('bei'), variantId: 'v-mango-1', requestedQty: 40, variant: { id: 'v-mango-1', label: '1 kg', unit: 'kg', sellingPrice: '180', product: { name: 'Alphonso Mango' } } }],
    quotations: [],
  },
];

const coupons = [
  { id: 'coupon-1', code: 'WELCOME100', type: 'FLAT', value: '100', minOrderValue: '300', isActive: true, timesUsed: 0, usageLimit: 1000 },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=70&auto=format';

const products = [
  { id: 'p-strawberry', name: 'Fresh Strawberry', imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=300&q=70&auto=format', variants: [{ id: 'v1', label: '250g Pack', sellingPrice: '80', stockQty: 52 }] },
  { id: 'p-cauliflower', name: 'Fresh Cauliflower', imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?w=300&q=70&auto=format', variants: [{ id: 'v2', label: '1 pc, ~600g', sellingPrice: '35', stockQty: 80 }] },
  { id: 'p-lemon', name: 'Yellow Lemon', imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&q=70&auto=format', variants: [{ id: 'v3', label: '500g Pack', sellingPrice: '28', stockQty: 99 }, { id: 'v3b', label: '1 kg', sellingPrice: '52', stockQty: 40 }] },
  { id: 'p-tomato', name: 'Farm Tomato', imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300&q=70&auto=format', variants: [{ id: 'v4', label: '1 kg', sellingPrice: '32', stockQty: 150 }] },
  { id: 'p-mango', name: 'Alphonso Mango', imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=70&auto=format', variants: [{ id: 'v-mango-1', label: '1 kg', sellingPrice: '180', stockQty: 5 }] },
  { id: 'p-almonds', name: 'Premium Almonds', imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300&q=70&auto=format', variants: [{ id: 'v5', label: '250g Pack', sellingPrice: '275', stockQty: 40 }] },
];

const categories = [
  { id: 'cat-fruits', name: 'Fruits' },
  { id: 'cat-veg', name: 'Vegetables' },
  { id: 'cat-leafy', name: 'Leafy Greens' },
  { id: 'cat-exotic', name: 'Exotic' },
  { id: 'cat-dry', name: 'Dry Fruits' },
];

const state = {
  role: 'ADMIN' as Role,
  phone: '',
  isOnline: true,
  deliveriesHistory: [
    { id: 'del-1', earning: '25', deliveredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), order: { orderNumber: 'GVRDEMO090', total: '190' } },
    { id: 'del-2', earning: '25', deliveredAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), order: { orderNumber: 'GVRDEMO095', total: '210' } },
  ],
  assignedDeliveries: [
    {
      id: 'del-current',
      acceptedAt: null as string | null,
      outForDeliveryAt: null as string | null,
      proofOtp: '4321',
      order: {
        orderNumber: 'GVRDEMO102',
        total: '210',
        paymentStatus: 'PENDING',
        items: [{ productNameSnapshot: 'Alphonso Mango', quantity: 1 }],
        address: { line1: '18 Anna Salai', city: 'Chennai', pincode: '600002' },
        user: { phone: '+919988776655', customerProfile: { name: null } },
      },
    },
  ],
};

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
    if (body.context === 'STAFF' && !ADMIN_PHONES.includes(body.phone)) {
      // Any other number logs in as a delivery partner for the demo.
    }
    return ok({ success: true, phone: body.phone, expiresInMinutes: 5, devOtp: '1234' }) as T;
  }
  if (method === 'POST' && path === '/auth/verify-otp') {
    state.phone = body.phone;
    state.role = ADMIN_PHONES.includes(body.phone) ? 'ADMIN' : 'DELIVERY_PARTNER';
    return ok({
      accessToken: 'offline-demo-token',
      refreshToken: 'offline-demo-refresh',
      user: { id: 'demo-user', phone: body.phone, role: state.role, name: state.role === 'DELIVERY_PARTNER' ? 'Karthik' : null },
    }) as T;
  }
  if (method === 'POST' && path === '/auth/refresh') {
    return ok({ accessToken: 'offline-demo-token' }) as T;
  }
  if (method === 'GET' && path === '/users/me') {
    return ok({
      id: 'demo-user',
      phone: state.phone,
      role: state.role,
      deliveryPartnerProfile: state.role === 'DELIVERY_PARTNER' ? { name: 'Karthik', isOnline: state.isOnline } : undefined,
    }) as T;
  }

  // --- Delivery partner ---
  if (method === 'PATCH' && path === '/delivery/status') {
    state.isOnline = body.isOnline;
    return ok({ isOnline: state.isOnline }) as T;
  }
  if (method === 'GET' && path === '/delivery/assigned') {
    return ok(state.assignedDeliveries) as T;
  }
  if (method === 'GET' && path === '/delivery/history') {
    return ok(state.deliveriesHistory) as T;
  }
  if (method === 'GET' && path === '/delivery/earnings') {
    const total = state.deliveriesHistory.reduce((s, d) => s + Number(d.earning), 0);
    return ok({ today: 0, thisWeek: 25, thisMonth: total, totalCompleted: state.deliveriesHistory.length, lifetimeEarnings: total }) as T;
  }
  const acceptMatch = m(/^\/delivery\/([^/]+)\/accept$/);
  if (acceptMatch && method === 'PATCH') {
    const d = state.assignedDeliveries.find((d) => d.id === acceptMatch[1]);
    if (d) d.acceptedAt = nowIso();
    return ok({ success: true }) as T;
  }
  const outMatch = m(/^\/delivery\/([^/]+)\/out-for-delivery$/);
  if (outMatch && method === 'PATCH') {
    const d = state.assignedDeliveries.find((d) => d.id === outMatch[1]);
    if (d) d.outForDeliveryAt = nowIso();
    return ok({ success: true }) as T;
  }
  const completeMatch = m(/^\/delivery\/([^/]+)\/complete$/);
  if (completeMatch && method === 'PATCH') {
    const d = state.assignedDeliveries.find((d) => d.id === completeMatch[1]);
    if (!d) fail(404, 'Delivery not found');
    if (body.otp !== d!.proofOtp) fail(400, 'Incorrect delivery OTP');
    state.assignedDeliveries = state.assignedDeliveries.filter((x) => x.id !== completeMatch![1]);
    state.deliveriesHistory.unshift({ id: uid('del'), earning: '25', deliveredAt: nowIso(), order: { orderNumber: d!.order.orderNumber, total: d!.order.total } });
    return ok({ success: true }) as T;
  }

  // --- Admin dashboard ---
  if (method === 'GET' && path === '/admin/dashboard') {
    return ok({
      sales: { today: { revenue: 828, orderCount: 3 }, thisWeek: { revenue: 1500 }, thisMonth: { revenue: 6788 } },
      orderPipeline: { PLACED: 1, PACKED: 1, DELIVERED: 1, ASSIGNED: 1 },
      inventory: { lowStockCount: 1 },
      delivery: { totalPartners: 1, onlinePartners: state.isOnline ? 1 : 0 },
      bulk: { NEW: 1 },
    }) as T;
  }
  if (method === 'GET' && path === '/admin/customers') {
    return ok(customers.map((c) => ({ id: c.id, phone: c.phone, isActive: c.isActive, customerProfile: { name: c.name }, _count: { orders: c.orders, bulkEnquiries: c.bulkEnquiries } }))) as T;
  }
  const custStatusMatch = m(/^\/admin\/customers\/([^/]+)\/status$/);
  if (custStatusMatch && method === 'PATCH') {
    const c = customers.find((c) => c.id === custStatusMatch[1]);
    if (c) c.isActive = body.isActive;
    return ok({ success: true }) as T;
  }
  if (method === 'GET' && path === '/admin/delivery-partners') {
    return ok(deliveryPartners.map((p) => ({ id: p.id, phone: p.phone, isActive: p.isActive, deliveryPartnerProfile: { name: p.name, vehicleInfo: p.vehicleInfo, isOnline: p.isOnline }, _count: { deliveriesDone: p.deliveriesDone } }))) as T;
  }
  if (method === 'POST' && path === '/admin/delivery-partners') {
    deliveryPartners.push({ id: uid('dp'), phone: body.phone, isActive: true, name: body.name, vehicleInfo: body.vehicleInfo ?? null, isOnline: false, deliveriesDone: 0 });
    return ok({ success: true }) as T;
  }
  const dpStatusMatch = m(/^\/admin\/delivery-partners\/([^/]+)\/status$/);
  if (dpStatusMatch && method === 'PATCH') {
    const p = deliveryPartners.find((p) => p.id === dpStatusMatch[1]);
    if (p) p.isActive = body.isActive;
    return ok({ success: true }) as T;
  }

  // --- Orders (admin) ---
  if (method === 'GET' && path.startsWith('/orders?')) {
    const params = new URLSearchParams(path.split('?')[1]);
    const status = params.get('status');
    return ok(status ? orders.filter((o) => o.status === status) : orders) as T;
  }
  if (method === 'GET' && path === '/orders') {
    return ok(orders) as T;
  }
  const orderGetMatch = m(/^\/orders\/([^/]+)$/);
  if (orderGetMatch && method === 'GET' && !path.includes('/status') && !path.includes('/assign')) {
    const order = orders.find((o) => o.id === orderGetMatch[1]);
    if (!order) fail(404, 'Order not found');
    return ok(order) as T;
  }
  const orderStatusMatch = m(/^\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    const order = orders.find((o) => o.id === orderStatusMatch[1]);
    if (!order) fail(404, 'Order not found');
    order!.status = body.status;
    return ok(order) as T;
  }
  const orderAssignMatch = m(/^\/orders\/([^/]+)\/assign$/);
  if (orderAssignMatch && method === 'PATCH') {
    const order = orders.find((o) => o.id === orderAssignMatch[1]);
    if (!order) fail(404, 'Order not found');
    order!.status = 'ASSIGNED';
    return ok(order) as T;
  }

  // --- Bulk (admin) ---
  if (method === 'GET' && path.startsWith('/bulk/enquiries?')) {
    return ok(bulkEnquiries) as T;
  }
  if (method === 'GET' && path === '/bulk/enquiries') {
    return ok(bulkEnquiries) as T;
  }
  const bulkGetMatch = m(/^\/bulk\/enquiries\/([^/]+)$/);
  if (bulkGetMatch && method === 'GET') {
    const enq = bulkEnquiries.find((e) => e.id === bulkGetMatch[1]);
    if (!enq) fail(404, 'Enquiry not found');
    return ok(enq) as T;
  }
  const quotationCreateMatch = m(/^\/bulk\/enquiries\/([^/]+)\/quotations$/);
  if (quotationCreateMatch && method === 'POST') {
    const enq = bulkEnquiries.find((e) => e.id === quotationCreateMatch[1]);
    if (!enq) fail(404, 'Enquiry not found');
    const q = { id: uid('quote'), status: 'DRAFT', totalAmount: String((body.items ?? []).reduce((s: number, i: any) => s + i.quantity * i.unitPrice - (i.discount ?? 0), 0) + (body.deliveryCharge ?? 0)) };
    enq!.quotations.unshift(q);
    enq!.status = 'QUOTED';
    return ok(q) as T;
  }
  const quotationSendMatch = m(/^\/bulk\/quotations\/([^/]+)\/send$/);
  if (quotationSendMatch && method === 'PATCH') {
    for (const enq of bulkEnquiries) {
      const q = enq.quotations.find((q: any) => q.id === quotationSendMatch[1]);
      if (q) q.status = 'SENT';
    }
    return ok({ success: true }) as T;
  }

  // --- Products ---
  if (method === 'GET' && path === '/products') {
    return ok(products.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, label: v.label })) }))) as T;
  }
  if (method === 'GET' && path === '/categories') {
    return ok(categories) as T;
  }
  if (method === 'POST' && path === '/products') {
    products.push({
      id: uid('prod'),
      name: body.name,
      imageUrl: body.imageUrl || PLACEHOLDER_IMAGE,
      variants: (body.variants ?? []).map((v: any) => ({ id: uid('var'), label: v.label, sellingPrice: String(v.sellingPrice), stockQty: v.stockQty ?? 0 })),
    });
    return ok({ success: true }) as T;
  }

  // --- Coupons ---
  if (method === 'GET' && path === '/coupons') {
    return ok(coupons) as T;
  }
  if (method === 'POST' && path === '/coupons') {
    coupons.push({ id: uid('coupon'), code: body.code, type: body.type, value: String(body.value), minOrderValue: String(body.minOrderValue ?? 0), isActive: true, timesUsed: 0, usageLimit: body.usageLimit ?? undefined as any });
    return ok({ success: true }) as T;
  }
  const couponDeactivateMatch = m(/^\/coupons\/([^/]+)$/);
  if (couponDeactivateMatch && method === 'DELETE') {
    const c = coupons.find((c) => c.id === couponDeactivateMatch[1]);
    if (c) c.isActive = false;
    return ok({ success: true }) as T;
  }

  // --- Reports ---
  if (method === 'GET' && path === '/reports/sales') {
    return ok({ totalOrders: orders.length, totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0), averageOrderValue: 1691, completedOrders: 1, cancelledOrders: 0 }) as T;
  }
  if (method === 'GET' && path === '/reports/products') {
    return ok([
      { product: { name: 'Alphonso Mango' }, unitsSold: 31, revenue: 5580 },
      { product: { name: 'Premium Almonds' }, unitsSold: 1, revenue: 275 },
      { product: { name: 'Fresh Strawberry' }, unitsSold: 1, revenue: 80 },
    ]) as T;
  }
  if (method === 'GET' && path === '/reports/inventory') {
    return ok(products.flatMap((p) => p.variants.map((v) => ({ product: p.name, variant: v.label, stockQty: v.stockQty, lowStock: v.stockQty < 10 })))) as T;
  }
  if (method === 'GET' && path === '/reports/bulk-conversion') {
    return ok({ totalEnquiries: 1, quoted: 1, accepted: 0, converted: 0, rejected: 0, conversionRate: 0, averageBulkOrderValue: 0 }) as T;
  }

  fail(404, `Offline demo: no mock handler for ${method} ${path}`);
}
