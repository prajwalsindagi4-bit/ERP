import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import ProductModal from '../components/ProductModal'

const Products = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/products?search=${search}`)
      setProducts(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search])

  const canEdit = user?.role === 'ADMIN'

  const handleAdd = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (err) {
      console.error(err)
      alert('Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        {canEdit && (
          <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition">
            <Plus size={18} className="mr-2" /> Add Product
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                {canEdit && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No products found.</td></tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{product.unit_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        product.current_stock <= product.minimum_stock_quantity ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      )}>
                        {product.current_stock}
                        {product.current_stock <= product.minimum_stock_quantity && ' (LOW STOCK)'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </div>
  )
}

export default Products
