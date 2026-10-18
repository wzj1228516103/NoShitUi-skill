export function filterOrders(orders, query = '', status = 'all') {
  const text = query.trim().toLowerCase();
  return orders.filter(order => `${order.id} ${order.customer}`.toLowerCase().includes(text));
}
