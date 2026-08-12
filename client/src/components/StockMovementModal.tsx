import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../services/api'

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  movementType: 'IN' | 'OUT'
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onSuccess, movementType }) => {
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Fetch products for dropdown
      api.get('/products')
        .then(res => setProducts(res.data.data))
        .catch(err => console.error('Failed to fetch products', err))
      
      setFormData({
        product_id: '',
        quantity: 1,
        reason: ''
      })
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_id) {
      setError('Please select a product')
      return
    }

    setLoading(true)
    setError('')

    try {
      const endpoint = movementType === 'IN' ? '/stock/in' : '/stock/out'
      await api.post(endpoint, formData)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className={`text-xl font-bold ${movementType === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
            Stock {movementType}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Product</label>
            <select required name="product_id" value={formData.product_id} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
              <option value="" disabled>-- Select a product --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} (SKU: {p.sku}) - Stock: {p.current_stock}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input required type="number" min="1" step="1" name="quantity" value={formData.quantity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason / Reference</label>
            <input required type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder={movementType === 'IN' ? 'e.g., Supplier Delivery' : 'e.g., Manual Adjustment'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 ${movementType === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              {loading ? 'Processing...' : `Confirm Stock ${movementType}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockMovementModal
