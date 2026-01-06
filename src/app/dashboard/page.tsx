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
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="container">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">Dashboard</span>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-800"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Welcome Card */}
                    <div className="glass-card mb-8 p-8">
                        <h1 className="mb-4 text-4xl font-bold text-white">
                            Welcome back!
                        </h1>
                        <p className="mb-6 text-xl text-gray-400">
                            You're signed in as <span className="font-medium text-blue-400">{session.user?.email}</span>
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Authentication successful
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="glass-card p-8">
                        <h2 className="mb-4 text-2xl font-bold text-white">
                            Ready to build
                        </h2>
                        <p className="mb-6 text-gray-400">
                            Your authentication system is set up and working. You can now add your application features here.
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-white">Secure authentication</h3>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Passwords are hashed with bcrypt for maximum security
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                                <div className="mb-2 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-white">Database ready</h3>
                                </div>
                                <p className="text-sm text-gray-500">
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
