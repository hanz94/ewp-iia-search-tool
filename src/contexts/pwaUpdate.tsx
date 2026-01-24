import { registerSW } from 'virtual:pwa-register'

export const registerPWAUpdates = () => {
    const updateSW = registerSW({
        immediate: true,

        onNeedRefresh() {
            // Activate new SW immediately
            updateSW(true)

            // Reload current context (iframe OR PWA)
            setTimeout(() => {
                window.location.reload()
            }, 300)
        },
    })
}
