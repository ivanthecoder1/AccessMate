import { useState, useEffect } from 'react'
const STORAGE_KEY = 'accessMateAutoFix'

export function useAutoFix() {
    const [autoFix, setAutoFix] = useState<boolean>(false)

    useEffect(() => {
        chrome.storage.sync.get([STORAGE_KEY], res => {
            setAutoFix(res[STORAGE_KEY] ?? false)
        })
    }, [])

    const toggleAutoFix = () => {
        const next = !autoFix
        setAutoFix(next)
        chrome.storage.sync.set({ [STORAGE_KEY]: next })
    }

    return { autoFix, toggleAutoFix }
}
