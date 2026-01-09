import { useState, type ReactNode } from 'react'
import { BranchContext, type Branch } from './branchContext'

const BRANCH_STORAGE_KEY = 'selected_branch'

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() => {
    const stored = localStorage.getItem(BRANCH_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        localStorage.removeItem(BRANCH_STORAGE_KEY)
      }
    }
    return null
  })

  const setBranch = (branch: Branch) => {
    setSelectedBranch(branch)
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branch))
  }

  const clearBranch = () => {
    setSelectedBranch(null)
    localStorage.removeItem(BRANCH_STORAGE_KEY)
  }

  return (
    <BranchContext.Provider 
      value={{ 
        selectedBranch, 
        branchId: selectedBranch?._id || null,
        setBranch, 
        clearBranch
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}
