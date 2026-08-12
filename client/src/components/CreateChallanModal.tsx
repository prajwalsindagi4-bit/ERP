import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import api from '../services/api'

interface CreateChallanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateChallanModal: React.FC<CreateChallanModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Fetch customers and products
      api.get('/customers').then(res => setCustomers(res.data.data)).catch(console.error)
      api.get('/products').then(res => setProducts(res.data.data)).catch(console.error)
      
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items]
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId) {
      setError('Please select a customer')
      return
    }

    if (items.some(item => !item.product_id || item.quantity < 1)) {
      setError('Please ensure all product rows have a selected product and a valid quantity')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/challans', { customer_id: customerId, items })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating the challan')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    let total = 0
    items.forEach(item => {
      const prod = products.find(p => p.id === item.product_id)
      if (prod) {
        total += prod.unit_price * item.quantity
      }
    })
    return total
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Create Sales Challan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                <option value="" disabled>-- Select a customer --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.customer_name} ({c.mobile_number})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Products</label>
                <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  <Plus size={16} className="mr-1" /> Add Product
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === item.product_id)
                  const lineTotal = selectedProduct ? selectedProduct.unit_price * item.quantity : 0

                  return (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <select 
                          required 
                          value={item.product_id} 
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm bg-white"
                        >
                          <option value="" disabled>-- Select product --</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} (₹{p.unit_price}) - Stock: {p.current_stock}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          min="1" 
                          required 
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-medium text-gray-700">
                        ₹{lineTotal.toFixed(2)}
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-30" disabled={items.length === 1}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Estimated Total:</span>
              <span className="text-xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition">
              {loading ? 'Creating...' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateChallanModal
