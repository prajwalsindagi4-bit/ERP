import { useEffect, useState } from 'react'
import api from '../services/api'
import { Plus, CheckCircle, XCircle, FileText } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import CreateChallanModal from '../components/CreateChallanModal'
import ViewChallanModal from '../components/ViewChallanModal'

const Challans = () => {
  const { user } = useAuth()
  const [challans, setChallans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewChallanId, setViewChallanId] = useState<string | null>(null)

  const fetchChallans = async () => {
    try {
      setLoading(true)
      const res = await api.get('/challans')
      setChallans(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallans()
  }, [])

  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES'

  const handleConfirm = async (id: string) => {
    try {
      await api.patch(`/challans/${id}/confirm`)
      alert('Challan confirmed successfully')
      fetchChallans()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error confirming challan')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/challans/${id}/cancel`)
      alert('Challan cancelled successfully')
      fetchChallans()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling challan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Challans</h1>
        {canCreate && (
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition">
            <Plus size={18} className="mr-2" /> Create Challan
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : challans.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No challans found.</td></tr>
              ) : (
                challans.map((challan: any) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {challan.challan_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {challan.customer.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(challan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        challan.status === 'CONFIRMED' ? "bg-green-100 text-green-800" :
                        challan.status === 'CANCELLED' ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      )}>
                        {challan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{challan.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setViewChallanId(challan.id)} className="text-blue-600 hover:text-blue-900 mr-3" title="View"><FileText size={18} /></button>
                      {canCreate && challan.status === 'DRAFT' && (
                        <button onClick={() => handleConfirm(challan.id)} className="text-green-600 hover:text-green-900 mr-3" title="Confirm">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {canCreate && (challan.status === 'DRAFT' || challan.status === 'CONFIRMED') && (
                        <button onClick={() => handleCancel(challan.id)} className="text-red-600 hover:text-red-900" title="Cancel">
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CreateChallanModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchChallans}
      />
      <ViewChallanModal
        isOpen={!!viewChallanId}
        onClose={() => setViewChallanId(null)}
        challanId={viewChallanId}
      />
    </div>
  )
}

export default Challans
