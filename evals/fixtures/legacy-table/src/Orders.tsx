import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
const columns = [{ accessorKey: 'id', header: 'Order' }, { accessorKey: 'status', header: 'Status' }];
const data = [{ id: 'A01', status: 'paid' }, { id: 'A02', status: 'pending' }];
export default function Orders() {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return <table><tbody>{table.getRowModel().rows.map(row => <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>;
}
