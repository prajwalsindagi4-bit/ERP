import { useEffect, useState } from 'react'
import api from '../services/api'
import { Users, Package, ClipboardList, FileText, AlertTriangle, Calendar } from 'lucide-react'

const Dashboard = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats')
        setData(res.data.data)
      } catch (err) {
        console.error('Failed to load stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>

  const stats = [
    { name: 'Total Customers', value: data.stats.totalCustomers, icon: <Users size={24} />, color: 'bg-blue-500' },
    { name: 'Total Products', value: data.stats.totalProducts, icon: <Package size={24} />, color: 'bg-green-500' },
    { name: 'Low Stock Products', value: data.stats.lowStockProducts, icon: <AlertTriangle size={24} />, color: 'bg-red-500' },
    { name: 'Total Challans', value: data.stats.totalChallans, icon: <FileText size={24} />, color: 'bg-purple-500' },
    { name: 'Confirmed Challans', value: data.stats.confirmedChallans, icon: <ClipboardList size={24} />, color: 'bg-indigo-500' },
    { name: 'Pending Follow-ups', value: data.stats.pendingFollowups, icon: <Calendar size={24} />, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className={`p-3 rounded-full text-white ${item.color} mr-5`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Recent Challans</h3>
          {data.recentChallans.length === 0 ? (
            <p className="text-gray-500">No recent challans found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {data.recentChallans.map((challan: any) => (
                <li key={challan.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{challan.challan_number}</p>
                    <p className="text-sm text-gray-500">{challan.customer.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      challan.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      challan.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challan.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">₹{challan.total_amount}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Upcoming Follow-ups</h3>
          {data.upcomingFollowups.length === 0 ? (
            <p className="text-gray-500">No upcoming follow-ups.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {data.upcomingFollowups.map((customer: any) => (
                <li key={customer.id} className="py-3 flex justify-between items-center">
                  <p className="font-medium text-gray-800">{customer.customer_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(customer.follow_up_date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
