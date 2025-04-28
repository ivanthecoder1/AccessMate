import { useState } from 'react'

type Issue = { type: string; count: number }

export function useAccessibility() {
    const [score, setScore] = useState<number | null>(null)
    const [issues, setIssues] = useState<Issue[]>([])

    const checkAccessibility = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabId = tabs[0]?.id
            if (typeof tabId === 'number') {
                chrome.tabs.sendMessage(
                    tabId,
                    { action: 'runAccessibilityCheck' },
                    (response) => {
                        if (response) {
                            setScore(response.score)
                            setIssues(response.issues)
                        }
                    }
                )
            }
        })
    }

    const fixIssue = (issueType: string) => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabId = tabs[0]?.id
            if (typeof tabId === 'number') {
                chrome.tabs.sendMessage(tabId, { action: 'fixIssue', issueType })
            }
        })
    }

    return { score, issues, checkAccessibility, fixIssue }
}
