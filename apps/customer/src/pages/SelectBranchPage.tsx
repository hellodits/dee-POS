import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { useBranch, type Branch } from '../context'
import api from '../lib/api'

export default function SelectBranchPage() {
  const navigate = useNavigate()
  const { setBranch } = useBranch()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<{ success: boolean; data: Branch[] }>('/branches', {
        params: { active_only: 'true' }
      })
      if (response.data.success && response.data.data) {
        setBranches(response.data.data)
      }
    } catch (err) {
      setError('Gagal memuat daftar cabang. Silakan coba lagi.')
      console.error('Failed to fetch branches:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectBranch = (branch: Branch) => {
    setBranch(branch)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl px-6 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold text-red-600">DEEPOS</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Pilih Cabang
        </h1>
        <p className="text-gray-500">
          Pilih lokasi restoran terdekat dengan Anda
        </p>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
            <p className="text-gray-500">Memuat daftar cabang...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">{error}</p>
            <button
              onClick={fetchBranches}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Branch List */}
        {!isLoading && !error && branches.length > 0 && (
          <div className="space-y-4">
            {branches.map((branch) => (
              <button
                key={branch._id}
                onClick={() => handleSelectBranch(branch)}
                className="w-full bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {branch.name}
                    </h3>
                    
                    <div className="flex items-start gap-2 text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{branch.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <ChevronRight className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && branches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Tidak ada cabang tersedia saat ini</p>
          </div>
        )}
      </div>
    </div>
  )
}
