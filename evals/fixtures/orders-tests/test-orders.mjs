import assert from 'node:assert/strict';
import { filterOrders } from './orders.js';
const orders = [{ id: 'A01', customer: 'Maya', status: 'paid' }, { id: 'A02', customer: 'Jon', status: 'pending' }, { id: 'B01', customer: 'Maya', status: 'pending' }];
assert.deepEqual(filterOrders(orders, '', 'paid').map(x => x.id), ['A01']);
assert.deepEqual(filterOrders(orders, ' maya ', 'pending').map(x => x.id), ['B01']);
assert.deepEqual(filterOrders(orders, 'A', 'all').map(x => x.id), ['A01', 'A02', 'B01']);
assert.deepEqual(filterOrders(orders, 'Jon', 'paid'), []);
assert.equal(orders.length, 3);
console.log('Order status, combined search, empty result and input preservation passed.');
