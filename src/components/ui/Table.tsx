import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }: TableProps) => {
  return (
    <thead className="bg-gray-50">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }: TableProps) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children }: TableProps) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {children}
    </tr>
  );
};

export const TableHead = ({ children }: TableProps) => {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
};

export const TableCell = ({ children }: TableProps) => {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      {children}
    </td>
  );
};
