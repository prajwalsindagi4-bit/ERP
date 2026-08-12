import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, Phone, Mail, MapPin, Building, Briefcase, FileText, Send } from 'lucide-react'
import clsx from 'clsx'

const CustomerDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/customers/${id}`)
      setCustomer(res.data.data)
    } catch (err) {
      console.error(err)
      alert('Failed to load customer details')
      navigate('/customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return

    try {
      setSubmittingNote(true)
      await api.post(`/customers/${id}/followups`, { note })
      setNote('')
      fetchCustomer() // Refresh timeline
    } catch (err) {
      console.error(err)
      alert('Failed to add follow-up note')
    } finally {
      setSubmittingNote(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading customer details...</div>
  }

  if (!customer) return null

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="p-2 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{customer.customer_name}</h1>
        <span className={clsx(
          "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase",
          customer.status === 'ACTIVE' ? "bg-green-100 text-green-800" :
          customer.status === 'INACTIVE' ? "bg-red-100 text-red-800" :
          "bg-blue-100 text-blue-800"
        )}>
          {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start text-sm">
                <Phone className="mr-3 text-gray-400 mt-0.5" size={18} />
                <span className="text-gray-800">{customer.mobile_number}</span>
              </div>
              {customer.email && (
                <div className="flex items-start text-sm">
                  <Mail className="mr-3 text-gray-400 mt-0.5" size={18} />
                  <span className="text-gray-800">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start text-sm">
                  <MapPin className="mr-3 text-gray-400 mt-0.5" size={18} />
                  <span className="text-gray-800">{customer.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Business Details</h3>
            <div className="space-y-4">
              <div className="flex items-start text-sm">
                <Briefcase className="mr-3 text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Business Name</div>
                  <div className="text-gray-800">{customer.business_name || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <Building className="mr-3 text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">Customer Type</div>
                  <div className="text-gray-800 capitalize">{customer.customer_type.toLowerCase()}</div>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <FileText className="mr-3 text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-gray-500 text-xs uppercase font-semibold">GST Number</div>
                  <div className="text-gray-800">{customer.gst_number || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col h-[600px]">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Follow-up Timeline</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
              {customer.followups && customer.followups.length > 0 ? (
                customer.followups.map((fup: any) => (
                  <div key={fup.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-gray-800">{fup.created_by?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{new Date(fup.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{fup.note}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 text-sm py-8">No follow-up notes yet.</div>
              )}
            </div>

            <div className="mt-auto border-t pt-4">
              <form onSubmit={handleAddFollowup} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a new follow-up note..." 
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 text-sm border"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={submittingNote}
                />
                <button 
                  type="submit" 
                  disabled={submittingNote || !note.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                >
                  <Send size={18} className="mr-2" /> Save
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDetails
