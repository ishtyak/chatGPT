'use client'
import { SnackbarProvider } from "notistack";

export default function Template({ children }: { children: React.ReactNode }) {
    return <div>
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
        {children}
    </div>
}