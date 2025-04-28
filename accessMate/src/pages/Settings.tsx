import { useAutoFix } from '../hooks/useAutoFix'

export default function Settings() {
    const { autoFix, toggleAutoFix } = useAutoFix()

    return (
        <main>
            <h2>Settings</h2>
            <label>
                <input type="checkbox" checked={autoFix} onChange={toggleAutoFix} />
                Auto-fix on page load
            </label>
        </main>
    )
}
