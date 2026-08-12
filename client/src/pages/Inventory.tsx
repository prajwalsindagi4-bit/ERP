import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'
import StockMovementModal from '../components/StockMovementModal'

const Inventory = () => {
  const { user } = useAuth()
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movementType, setMovementType] = useState<'IN'|'OUT'>('IN')

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const res = await api.get('/stock-movements')
      setMovements(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  const canEdit = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Movements</h1>
        {canEdit && (
          <div className="flex gap-3">
            <button 
              onClick={() => { setMovementType('OUT'); setIsModalOpen(true); }}
              className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700 transition"
            >
              <ArrowDownCircle size={18} className="mr-2" /> Stock OUT
            </button>
            <button 
              onClick={() => { setMovementType('IN'); setIsModalOpen(true); }}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition"
            >
              <ArrowUpCircle size={18} className="mr-2" /> Stock IN
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No stock movements found.</td></tr>
              ) : (
                movements.map((mov: any) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mov.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{mov.product.product_name}</div>
                      <div className="text-sm text-gray-500">{mov.product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        mov.movement_type === 'IN' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mov.movement_type === 'IN' ? '+' : '-'}{mov.quantity_changed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mov.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mov.created_by.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <StockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMovements}
        movementType={movementType}
      />
    </div>
  )
}

export default Inventory
