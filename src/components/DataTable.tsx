import React from 'react';
import { Star, MoreVertical, ExternalLink } from 'lucide-react';
import type { ProductRow } from '../lib/flipkartData';

const defaultProducts: ProductRow[] = [
  {
    id: 1,
    name: 'Ultra-Bass Wireless Headphones',
    category: 'Electronics',
<<<<<<< HEAD
    price: '₹9,999.00',
=======
    price: '$129.99',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    stock: 'High',
    rating: 4.8,
    reviews: 1240,
    marketShare: '24%',
    trend: 'up',
    imageUrl: 'https://picsum.photos/seed/prod1/40/40',
    linkUrl: 'https://www.flipkart.com'
  },
  {
    id: 2,
    name: 'Ergo-Click Mechanical Keyboard',
    category: 'Accessories',
<<<<<<< HEAD
    price: '₹6,499.00',
=======
    price: '$89.50',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    stock: 'Medium',
    rating: 4.5,
    reviews: 850,
    marketShare: '18%',
    trend: 'down',
    imageUrl: 'https://picsum.photos/seed/prod2/40/40',
    linkUrl: 'https://www.flipkart.com'
  },
  {
    id: 3,
    name: 'Pro-Vision VR Headset',
    category: 'Electronics',
<<<<<<< HEAD
    price: '₹34,999.00',
=======
    price: '$499.00',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    stock: 'Low',
    rating: 4.9,
    reviews: 320,
    marketShare: '12%',
    trend: 'up',
    imageUrl: 'https://picsum.photos/seed/prod3/40/40',
    linkUrl: 'https://www.flipkart.com'
  },
  {
    id: 4,
    name: 'Smart-Fit Fitness Tracker',
    category: 'Wearables',
<<<<<<< HEAD
    price: '₹4,999.00',
=======
    price: '$59.99',
>>>>>>> d81990d91b7f7e9c92989988d1d89676b3603531
    stock: 'High',
    rating: 4.2,
    reviews: 2100,
    marketShare: '31%',
    trend: 'stable',
    imageUrl: 'https://picsum.photos/seed/prod4/40/40',
    linkUrl: 'https://www.flipkart.com'
  }
];

interface DataTableProps {
  products?: ProductRow[];
  isLoading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ products, isLoading = false }) => {
  const tableData = products && products.length ? products : defaultProducts;

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Market Share</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tableData.map((product) => (
            <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">{product.name}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">{product.category}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-mono font-bold text-white">{product.price}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">{product.rating}</span>
                  <span className="text-[10px] text-slate-500">({product.reviews})</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: product.marketShare }} />
                  </div>
                  <span className="text-xs font-bold text-white">{product.marketShare}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                  product.stock === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
                  product.stock === 'Medium' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {product.stock} Stock
                </span>
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <a href={product.linkUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {isLoading && (
            <tr>
              <td colSpan={7} className="py-6 px-4 text-center text-xs text-slate-400">
                Fetching latest Flipkart sub-category data...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
