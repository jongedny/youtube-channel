'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="fixed inset-0 -z-10" style={{ background: 'var(--gradient-mesh)' }} />
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-foreground-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {/* Background Gradient Mesh */}
            <div className="fixed inset-0 -z-10" style={{ background: 'var(--gradient-mesh)' }} />

            {/* Navigation */}
            <nav className="glass-strong border-b border-border">
                <div className="container">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold gradient-text">Dashboard</span>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="btn btn-secondary"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Welcome Card */}
                    <div className="glass-strong rounded-2xl p-8 mb-8">
                        <h1 className="text-4xl font-bold mb-4">
                            Welcome <span className="gradient-text">Back!</span>
                        </h1>
                        <p className="text-xl text-foreground-secondary mb-6">
                            You're successfully logged in as <span className="text-primary font-medium">{session.user?.email}</span>
                        </p>
                        <div className="flex items-center gap-2 text-sm text-foreground-tertiary">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Authentication successful
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4">
                            <span className="gradient-text">Ready to Build</span>
                        </h2>
                        <p className="text-foreground-secondary mb-6">
                            Your authentication system is now set up and working! You can now add your application features here.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold">Secure Authentication</h3>
                                </div>
                                <p className="text-sm text-foreground-tertiary">
                                    Passwords are hashed with bcrypt for maximum security
                                </p>
                            </div>

                            <div className="glass p-4 rounded-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold">Database Ready</h3>
                                </div>
                                <p className="text-sm text-foreground-tertiary">
                                    Connected to Neon Postgres for reliable data storage
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
