import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useCallback, useState, useEffect, ComponentType } from 'react'
import FullScreenLoader from '@/app/components/ui/fullscreen.loader'

type UserRole = 'admin' | 'staff'

interface UseAuthOptions {
    userType?: UserRole
    redirectTo?: string
    unauthorizedRedirect?: string
}

declare module "next-auth" {
    interface Session {
        user: {
            id: number
            name: string
            email: string
            userType: 'admin' | 'staff'
        }
    }
}

export function withAuth(options?: UseAuthOptions) {
    const session = useSession()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const logout = useCallback(() => {
        setIsLoggingOut(true)
        signOut({ redirect: false })
            .then(() => router.push(options?.redirectTo || '/signin'))
            .finally(() => setIsLoggingOut(false))
    }, [router, options?.redirectTo])

    const isLoading = session.status === 'loading'
    const userRole = (session.data?.user)?.userType
    const isAuthenticated = session.status === 'authenticated' && !!userRole
    const hasValidRole = options?.userType ? userRole === options.userType : true

    return {
        session,
        logout,
        isLoading,
        isLoggingOut,
        isAuthenticated,
        hasValidRole,
        user: session.data?.user,
    }
}

export function withAuthLayout<P extends object>(options?: UseAuthOptions) {
    return function (WrappedLayout: ComponentType<P>) {
        return function AuthLayoutWrapper(props: P) {
            const auth = withAuth(options)
            const router = useRouter()

            useEffect(() => {
                if (auth.isLoading) return

                if (!auth.isAuthenticated) {
                    router.push(options?.redirectTo || '/signin')
                } else if (!auth.hasValidRole) {
                    router.push(options?.unauthorizedRedirect || '/unauthorized')
                }
            }, [auth.isLoading, auth.isAuthenticated, auth.hasValidRole, router])

            if (auth.isLoading) {
                return (
                    <div>
                        <FullScreenLoader />
                    </div>
                )
            }

            if (auth.isLoggingOut) {
                return <FullScreenLoader>Logging out...</FullScreenLoader>
            }

            if (!auth.isAuthenticated || !auth.hasValidRole) {
                return null
            }

            return <WrappedLayout {...props} />
        }
    }
}
