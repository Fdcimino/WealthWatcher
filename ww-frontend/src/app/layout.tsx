import Navbar from '@/components/navbar'
import '@/app/globals.css'
import { Inter } from 'next/font/google'

import { AuthProvider } from './AuthContext'
import Footer from '@/components/footer'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Wealth Watcher',
    description: 'A personal finance app for the modern age.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
            <body className={inter.className + " " + "bg-slate-600"}>
                <AuthProvider>
                    <Navbar />
                    {children}
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    )
}
