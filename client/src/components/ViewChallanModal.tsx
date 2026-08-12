import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import api from '../services/api'
import clsx from 'clsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ViewChallanModalProps {
  isOpen: boolean
  onClose: () => void
  challanId: string | null
}

const ViewChallanModal: React.FC<ViewChallanModalProps> = ({ isOpen, onClose, challanId }) => {
  const [challan, setChallan] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && challanId) {
      setLoading(true)
      api.get(`/challans/${challanId}`)
        .then(res => setChallan(res.data.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, challanId])

  const handleDownloadPDF = () => {
    const input = document.getElementById('pdf-challan-content')
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Challan_${challan.challan_number}.pdf`)
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Challan Details {challan && `- ${challan.challan_number}`}
          </h2>
          <div className="flex items-center gap-3">
            {challan && (
              <button onClick={handleDownloadPDF} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                <Download size={18} className="mr-1" /> PDF
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div id="pdf-challan-content" className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {loading ? (
            <div className="text-center text-gray-500">Loading details...</div>
          ) : !challan ? (
            <div className="text-center text-red-500">Failed to load challan.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <div className="text-sm text-gray-500 font-semibold uppercase">Customer</div>
                  <div className="text-gray-900 font-medium">{challan.customer.customer_name}</div>
                  <div className="text-gray-600 text-sm">{challan.customer.mobile_number}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-semibold uppercase">Status & Info</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx(
                      "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                      challan.status === 'CONFIRMED' ? "bg-green-100 text-green-800" :
                      challan.status === 'CANCELLED' ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {challan.status}
                    </span>
                    <span className="text-sm text-gray-600 border-l pl-2">{new Date(challan.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {challan.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.product_name_snapshot}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.sku_snapshot}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-500">₹{item.unit_price_snapshot}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Totals:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{challan.total_quantity}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">₹{challan.total_amount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewChallanModal
