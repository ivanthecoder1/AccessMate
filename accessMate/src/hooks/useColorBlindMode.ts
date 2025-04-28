import { useState } from 'react'

export function useColorBlindMode() {
    const [mode, setMode] = useState<string>('')

    const selectMode = (newMode: string) => {
        setMode(newMode)
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabId = tabs[0]?.id
            if (typeof tabId === 'number') {
                chrome.tabs.sendMessage(tabId, { action: newMode })
            }
        })
    }

    return { mode, selectMode }
}
