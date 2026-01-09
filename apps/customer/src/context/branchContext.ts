import { createContext, useContext } from 'react'

// Branch type
export interface Branch {
  _id: string
  name: string
  address: string
  phone: string
  is_active: boolean
}

export interface BranchContextType {
  selectedBranch: Branch | null
  branchId: string | null
  setBranch: (branch: Branch) => void
  clearBranch: () => void
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined)

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}
