import './globals.css'
import { Inter } from 'next/font/google'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Void Mod Training',
  description: 'Enterprise-level esports moderator training and certification platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-void-dark-900">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-void-dark-900 via-void-purple-950 to-void-dark-900">
          {/* Animated background particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-radial from-void-purple-600/20 via-transparent to-transparent" />
            <motion.div
              className="absolute top-0 left-0 w-96 h-96 bg-void-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-void-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                x: [0, -100, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-0 left-1/2 w-96 h-96 bg-void-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                x: [-50, 50, -50],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
