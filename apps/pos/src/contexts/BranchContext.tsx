import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import api, { auth, ApiResponse } from '@/lib/api'

// Branch type
export interface Branch {
  _id: string
  name: string
  address: string
  phone: string
  is_active: boolean
}

interface BranchContextType {
  // Current user's assigned branch (from JWT)
  userBranch: Branch | null
  // Currently selected branch for viewing (OWNER can switch)
  activeBranch: Branch | null
  // All available branches (for OWNER dropdown)
  branches: Branch[]
  // Is user an OWNER who can switch branches?
  canSwitchBranch: boolean
  // Loading state
  isLoading: boolean
  // Switch to a different branch (OWNER only)
  switchBranch: (branch: Branch) => void
  // Refresh branches list
  refreshBranches: () => Promise<void>
  // Get branch_id for API calls
  getActiveBranchId: () => string | undefined
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

const ACTIVE_BRANCH_KEY = 'pos_active_branch'

export function BranchProvider({ children }: { children: ReactNode }) {
  const [userBranch, setUserBranch] = useState<Branch | null>(null)
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const user = auth.getUser()
  const isOwner = user?.role === 'owner'
  const canSwitchBranch = isOwner

  // Fetch all branches (for OWNER dropdown)
  const refreshBranches = useCallback(async () => {
    if (!isOwner) return
    
    try {
      const response = await api.get<ApiResponse<Branch[]>>('/branches', {
        params: { active_only: 'true' }
      })
      if (response.data.success && response.data.data) {
        setBranches(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    }
  }, [isOwner])

  // Fetch user's assigned branch
  const fetchUserBranch = useCallback(async () => {
    const user = auth.getUser()
    if (!user) return

    // OWNER doesn't have an assigned branch
    if (user.role === 'owner') {
      setUserBranch(null)
      return
    }

    // For other roles, fetch their branch info
    if (user.branch_id) {
      try {
        const response = await api.get<ApiResponse<Branch>>(`/branches/${user.branch_id}`)
        if (response.data.success && response.data.data) {
          setUserBranch(response.data.data)
          setActiveBranch(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch user branch:', error)
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      
      const user = auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      if (user.role === 'owner') {
        // OWNER: Load all branches and restore last selected
        await refreshBranches()
        
        // Try to restore last selected branch
        const stored = localStorage.getItem(ACTIVE_BRANCH_KEY)
        if (stored) {
          try {
            const branch = JSON.parse(stored)
            setActiveBranch(branch)
          } catch (e) {
            localStorage.removeItem(ACTIVE_BRANCH_KEY)
          }
        }
      } else {
        // Non-OWNER: Fetch their assigned branch
        await fetchUserBranch()
      }
      
      setIsLoading(false)
    }

    init()
  }, [refreshBranches, fetchUserBranch])

  // Update branches list when it changes
  useEffect(() => {
    if (isOwner && branches.length > 0 && !activeBranch) {
      // Auto-select first branch if none selected
      setActiveBranch(branches[0])
    }
  }, [branches, activeBranch, isOwner])

  const switchBranch = (branch: Branch) => {
    if (!canSwitchBranch) return
    
    setActiveBranch(branch)
    localStorage.setItem(ACTIVE_BRANCH_KEY, JSON.stringify(branch))
    
    // Trigger a page refresh to reload data with new branch
    window.dispatchEvent(new CustomEvent('branch-changed', { detail: branch }))
  }

  const getActiveBranchId = (): string | undefined => {
    return activeBranch?._id
  }

  return (
    <BranchContext.Provider 
      value={{ 
        userBranch,
        activeBranch,
        branches,
        canSwitchBranch,
        isLoading,
        switchBranch,
        refreshBranches,
        getActiveBranchId
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}
