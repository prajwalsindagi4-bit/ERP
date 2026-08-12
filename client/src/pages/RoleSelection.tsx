import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ShieldAlert, TrendingUp, Package, Calculator, Package as PackageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roles = [
  { id: 'ADMIN', name: 'Admin', description: 'Full system access and configuration', icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200', hover: 'hover:border-purple-500' },
  { id: 'SALES', name: 'Sales', description: 'Manage customers and sales challans', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200', hover: 'hover:border-blue-500' },
  { id: 'WAREHOUSE', name: 'Warehouse', description: 'Manage inventory and stock movements', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200', hover: 'hover:border-amber-500' },
  { id: 'ACCOUNTS', name: 'Accounts', description: 'View-only auditing and financial tracking', icon: Calculator, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200', hover: 'hover:border-green-500' },
]

const RoleSelection: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // If already logged in, go straight to dashboard
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleRoleSelect = (roleId: string) => {
    navigate(`/login?role=${roleId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="flex justify-center text-blue-600 mb-6">
          <PackageIcon size={56} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to the ERP System
        </h2>
        <p className="mt-2 text-center text-lg text-gray-600">
          Please select your role to continue
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-10 px-6 shadow-xl rounded-2xl sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <div 
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`relative rounded-xl border-2 ${role.border} bg-white p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${role.hover} flex items-start`}
                >
                  <div className={`rounded-lg inline-flex p-3 ${role.bg} ${role.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
