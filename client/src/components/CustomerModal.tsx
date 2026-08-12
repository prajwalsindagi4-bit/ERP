import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../services/api'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customer?: any
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSuccess, customer }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    business_name: '',
    mobile_number: '',
    email: '',
    customer_type: 'RETAIL',
    status: 'ACTIVE',
    address: '',
    gst_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_name: customer.customer_name || '',
        business_name: customer.business_name || '',
        mobile_number: customer.mobile_number || '',
        email: customer.email || '',
        customer_type: customer.customer_type || 'RETAIL',
        status: customer.status || 'ACTIVE',
        address: customer.address || '',
        gst_number: customer.gst_number || ''
      })
    } else {
      setFormData({
        customer_name: '',
        business_name: '',
        mobile_number: '',
        email: '',
        customer_type: 'RETAIL',
        status: 'ACTIVE',
        address: '',
        gst_number: ''
      })
    }
    setError('')
  }, [customer, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (customer) {
        await api.put(`/customers/${customer.id}`, formData)
      } else {
        await api.post('/customers', formData)
      }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input required type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input required type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="customer_type" value={formData.customer_type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GST Number</label>
            <input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerModal
