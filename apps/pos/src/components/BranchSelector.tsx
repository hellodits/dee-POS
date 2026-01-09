import { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, Check, MapPin } from 'lucide-react'
import { useBranch, Branch } from '@/contexts/BranchContext'

export function BranchSelector() {
  const { activeBranch, branches, canSwitchBranch, switchBranch, isLoading } = useBranch()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg animate-pulse">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Memuat...</span>
      </div>
    )
  }

  // No branch selected
  if (!activeBranch) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <Building2 className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-yellow-600 font-medium">Pilih Cabang</span>
      </div>
    )
  }

  // Non-OWNER: Just display current branch (no dropdown)
  if (!canSwitchBranch) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary max-w-[150px] truncate">
          {activeBranch.name}
        </span>
      </div>
    )
  }

  // OWNER: Show dropdown to switch branches
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary max-w-[150px] truncate">
          {activeBranch.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pilih Cabang
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {branches.map((branch) => (
              <BranchOption
                key={branch._id}
                branch={branch}
                isSelected={branch._id === activeBranch._id}
                onSelect={() => {
                  switchBranch(branch)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
          
          {branches.length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada cabang tersedia</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface BranchOptionProps {
  branch: Branch
  isSelected: boolean
  onSelect: () => void
}

function BranchOption({ branch, isSelected, onSelect }: BranchOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        <Building2 className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
            {branch.name}
          </span>
          {isSelected && (
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {branch.address}
          </span>
        </div>
      </div>
    </button>
  )
}
