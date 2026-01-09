import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, Loader2, AlertCircle, RefreshCw, Plus, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BranchList } from './BranchList'
import { BranchForm } from './BranchForm'
import { branchesApi, Branch } from '@/lib/api'

interface BranchesPageProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function BranchesPage({ isMobile, onToggleSidebar }: BranchesPageProps) {
  const { t } = useTranslation()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchBranches = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await branchesApi.getAll()
      setBranches(response.data.data || [])
    } catch (err: any) {
      setError(err.response?.data?.error || t('branches.failedToLoad'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  const handleAdd = () => {
    setEditingBranch(null)
    setIsFormOpen(true)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setIsFormOpen(true)
  }

  const handleDelete = async (branchId: string) => {
    if (!confirm(t('branches.confirmDelete'))) return
    
    try {
      await branchesApi.delete(branchId)
      setBranches(prev => prev.filter(b => b._id !== branchId))
    } catch (err: any) {
      alert(err.response?.data?.error || t('branches.failedToDelete'))
    }
  }

  const handleToggleActive = async (branch: Branch) => {
    try {
      await branchesApi.update(branch._id, { is_active: !branch.is_active })
      setBranches(prev => prev.map(b => 
        b._id === branch._id ? { ...b, is_active: !b.is_active } : b
      ))
    } catch (err: any) {
      alert(err.response?.data?.error || t('branches.failedToToggle'))
    }
  }

  const handleSave = async (data: { name: string; address: string; phone: string }) => {
    setIsSaving(true)
    try {
      if (editingBranch) {
        const response = await branchesApi.update(editingBranch._id, data)
        setBranches(prev => prev.map(b => 
          b._id === editingBranch._id ? response.data.data! : b
        ))
      } else {
        const response = await branchesApi.create(data)
        setBranches(prev => [...prev, response.data.data!])
      }
      setIsFormOpen(false)
      setEditingBranch(null)
    } catch (err: any) {
      alert(err.response?.data?.error || t('branches.failedToSave'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <Header isMobile={isMobile} onToggleSidebar={onToggleSidebar} title={t('branches.title')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('branches.loadingData')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <Header isMobile={isMobile} onToggleSidebar={onToggleSidebar} title={t('branches.title')} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <button 
              onClick={fetchBranches}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      <Header isMobile={isMobile} onToggleSidebar={onToggleSidebar} title={t('branches.title')} />

      <main className="flex-1 p-4 sm:p-6">
        <Card className="bg-card border border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t('branches.branchList')} ({branches.length})
              </CardTitle>
              <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                {t('branches.addBranch')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BranchList
              branches={branches}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              isMobile={isMobile}
            />
          </CardContent>
        </Card>
      </main>

      <BranchForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingBranch(null) }}
        onSave={handleSave}
        editingBranch={editingBranch}
        isSaving={isSaving}
      />
    </div>
  )
}

function Header({ isMobile, onToggleSidebar, title }: { isMobile: boolean; onToggleSidebar: () => void; title: string }) {
  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h1>
      </div>
    </div>
  )
}
