import { useEffect, useCallback, useRef } from 'react'
import { useBranch, Branch } from '@/contexts/BranchContext'

/**
 * Hook to listen for branch changes and trigger a callback
 * Use this in pages/components that need to refetch data when branch changes
 * 
 * @param onBranchChange - Callback to run when branch changes
 * @param deps - Additional dependencies for the callback
 * 
 * @example
 * useBranchChange(() => {
 *   fetchProducts()
 * })
 */
export function useBranchChange(
  onBranchChange: (branch: Branch | null) => void,
  deps: React.DependencyList = []
) {
  const { activeBranch } = useBranch()
  const previousBranchRef = useRef<string | null>(null)
  const isFirstRender = useRef(true)

  // Memoize callback with deps
  const memoizedCallback = useCallback(onBranchChange, deps)

  useEffect(() => {
    const currentBranchId = activeBranch?._id || null

    // Skip first render - let the component's own useEffect handle initial load
    if (isFirstRender.current) {
      isFirstRender.current = false
      previousBranchRef.current = currentBranchId
      return
    }

    // Only trigger if branch actually changed
    if (previousBranchRef.current !== currentBranchId) {
      previousBranchRef.current = currentBranchId
      memoizedCallback(activeBranch)
    }
  }, [activeBranch, memoizedCallback])

  // Also listen for the custom event (for immediate response)
  useEffect(() => {
    const handleBranchChanged = (event: CustomEvent<Branch>) => {
      memoizedCallback(event.detail)
    }

    window.addEventListener('branch-changed', handleBranchChanged as EventListener)
    return () => {
      window.removeEventListener('branch-changed', handleBranchChanged as EventListener)
    }
  }, [memoizedCallback])

  return { activeBranch }
}

/**
 * Hook that returns the active branch ID for API calls
 * Automatically updates when branch changes
 */
export function useActiveBranchId(): string | undefined {
  const { activeBranch } = useBranch()
  return activeBranch?._id
}
