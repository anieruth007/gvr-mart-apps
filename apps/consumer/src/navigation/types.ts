export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
  BulkOrderForm: undefined;
  MyEnquiries: undefined;
  QuotationDetail: { enquiryId: string; quotationId: string };
  Notifications: undefined;
  AddressList: undefined;
  AddAddress: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Account: undefined;
};
