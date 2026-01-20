'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Character {
    id: number;
    name: string;
    species: string;
    pocketArtifact: string;
    roleAndVibe: string;
    backstory: string | null;
    isOriginal: boolean;
    generatedBy: string;
    createdAt: Date;
}

interface Scenario {
    id: number;
    title: string;
    description: string;
    characterIds: string;
    location: string | null;
    mission: string | null;
    generatedBy: string;
    createdAt: Date;
}

interface ScenarioImage {
    id: number;
    scenarioId: number;
    url: string;
    prompt: string | null;
    generatedBy: string;
    createdAt: Date;
}

interface ScenarioVideo {
    id: number;
    scenarioId: number;
    url: string;
    prompt: string | null;
    generatedBy: string;
    createdAt: Date;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [scenarioImages, setScenarioImages] = useState<Record<number, ScenarioImage>>({});
    const [scenarioVideos, setScenarioVideos] = useState<Record<number, ScenarioVideo>>({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<'character' | 'scenario' | null>(null);
    const [generatingImage, setGeneratingImage] = useState<number | null>(null);
    const [generatingVideo, setGeneratingVideo] = useState<number | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    async function fetchData() {
        try {
            const [charsRes, scenariosRes, imagesRes, videosRes] = await Promise.all([
                fetch('/api/characters'),
                fetch('/api/scenarios'),
                fetch('/api/images'),
                fetch('/api/videos')
            ]);

            if (charsRes.ok) {
                const data = await charsRes.json();
                setCharacters(data.characters || []);
            }

            if (scenariosRes.ok) {
                const data = await scenariosRes.json();
                setScenarios(data.scenarios || []);
            }

            if (imagesRes.ok) {
                const data = await imagesRes.json();
                const imageMap: Record<number, ScenarioImage> = {};
                data.images?.forEach((img: ScenarioImage) => {
                    if (img.scenarioId) {
                        imageMap[img.scenarioId] = img;
                    }
                });
                setScenarioImages(imageMap);
            }

            if (videosRes.ok) {
                const data = await videosRes.json();
                const videoMap: Record<number, ScenarioVideo> = {};
                data.videos?.forEach((vid: ScenarioVideo) => {
                    if (vid.scenarioId) {
                        videoMap[vid.scenarioId] = vid;
                    }
                });
                setScenarioVideos(videoMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function generateCharacter() {
        setGenerating('character');
        try {
            const res = await fetch('/api/generate/character', { method: 'POST' });
            if (res.ok) {
                await fetchData();
                alert('✅ New character generated!');
            } else {
                alert('❌ Failed to generate character');
            }
        } catch (error) {
            console.error('Error generating character:', error);
            alert('❌ Error generating character');
        } finally {
            setGenerating(null);
        }
    }

    async function generateScenario() {
        setGenerating('scenario');
        try {
            const res = await fetch('/api/generate/scenario', { method: 'POST' });
            if (res.ok) {
                await fetchData();
                alert('✅ New scenario generated!');
            } else {
                alert('❌ Failed to generate scenario');
            }
        } catch (error) {
            console.error('Error generating scenario:', error);
            alert('❌ Error generating scenario');
        } finally {
            setGenerating(null);
        }
    }

    async function generateScenarioImage(scenarioId: number) {
        setGeneratingImage(scenarioId);
        try {
            const res = await fetch('/api/generate/scenario-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenarioId })
            });
            if (res.ok) {
                await fetchData();
                alert('✅ Scenario image generated!');
            } else {
                alert('❌ Failed to generate image');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert('❌ Error generating image');
        } finally {
            setGeneratingImage(null);
        }
    }

    async function generateScenarioVideo(scenarioId: number) {
        setGeneratingVideo(scenarioId);
        try {
            const res = await fetch('/api/generate/scenario-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenarioId })
            });
            if (res.ok) {
                await fetchData();
                alert('✅ Scenario video generated! (8 seconds)');
            } else {
                const data = await res.json();
                alert(`❌ Failed to generate video: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating video:', error);
            alert('❌ Error generating video');
        } finally {
            setGeneratingVideo(null);
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-gray-400">Loading PocketRot...</p>
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500">
                                <span className="text-xl">🎮</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold gradient-text">PocketRot</span>
                                <p className="text-xs text-gray-500">Small Scale. Big Glitch. Pure Rot.</p>
                            </div>
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
                <div className="mx-auto max-w-7xl">
                    {/* Welcome Card */}
                    <div className="glass-card mb-8 p-8">
                        <h1 className="mb-2 text-4xl font-bold gradient-text">
                            Welcome to PocketRot HQ
                        </h1>
                        <p className="mb-4 text-gray-400">
                            Manage your 4.20-inch glitched universe • Signed in as <span className="font-medium text-blue-400">{session.user?.email}</span>
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="text-2xl">🦝</span>
                                <span>{characters.length} Characters</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="text-2xl">🎬</span>
                                <span>{scenarios.length} Scenarios</span>
                            </div>
                        </div>
                    </div>

                    {/* Generation Controls */}
                    <div className="glass-card mb-8 p-6">
                        <h2 className="mb-4 text-xl font-bold text-white">AI Generation Controls</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <button
                                onClick={generateCharacter}
                                disabled={generating !== null}
                                className="flex items-center justify-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-left transition-all hover:border-purple-500/50 hover:bg-purple-500/20 disabled:opacity-50"
                            >
                                <span className="text-4xl">🎨</span>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">Generate Character</h3>
                                    <p className="text-sm text-gray-400">Create a new glitched animal (Weekly auto)</p>
                                </div>
                                {generating === 'character' && (
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                                )}
                            </button>

                            <button
                                onClick={generateScenario}
                                disabled={generating !== null}
                                className="flex items-center justify-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-left transition-all hover:border-blue-500/50 hover:bg-blue-500/20 disabled:opacity-50"
                            >
                                <span className="text-4xl">🎬</span>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">Generate Scenario</h3>
                                    <p className="text-sm text-gray-400">Create a new scene (Daily auto)</p>
                                </div>
                                {generating === 'scenario' && (
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Characters Section */}
                    <div className="glass-card mb-8 p-6">
                        <h2 className="mb-4 text-2xl font-bold text-white">Characters ({characters.length})</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {characters.map((char) => (
                                <div key={char.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-white">{char.name}</h3>
                                            <p className="text-sm text-gray-400">{char.species}</p>
                                        </div>
                                        {char.isOriginal && (
                                            <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
                                                Original
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-2 flex items-center gap-2 text-sm text-purple-400">
                                        <span>✨</span>
                                        <span>{char.pocketArtifact}</span>
                                    </div>
                                    <p className="mb-2 text-sm text-gray-500">{char.roleAndVibe}</p>
                                    {char.backstory && (
                                        <p className="text-xs text-gray-600">{char.backstory}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scenarios Section */}
                    <div className="glass-card p-6">
                        <h2 className="mb-4 text-2xl font-bold text-white">Scenarios ({scenarios.length})</h2>
                        <div className="space-y-6">
                            {scenarios.map((scenario) => (
                                <div key={scenario.id} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                                    <div className="mb-3 flex items-start justify-between">
                                        <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(scenario.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {scenario.location && (
                                        <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
                                            <span>📍</span>
                                            <span>{scenario.location}</span>
                                        </div>
                                    )}
                                    {scenario.mission && (
                                        <div className="mb-2 flex items-center gap-2 text-sm text-pink-400">
                                            <span>🎯</span>
                                            <span>{scenario.mission}</span>
                                        </div>
                                    )}
                                    <p className="mb-3 text-sm text-gray-400">{scenario.description}</p>

                                    {/* Image Section */}
                                    <div className="mt-4 border-t border-gray-800 pt-4">
                                        {scenarioImages[scenario.id] ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={scenarioImages[scenario.id].url}
                                                    alt={scenario.title}
                                                    className="w-full rounded-lg border border-gray-700"
                                                />
                                                <p className="text-xs text-gray-600">Generated by {scenarioImages[scenario.id].generatedBy}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => generateScenarioImage(scenario.id)}
                                                disabled={generatingImage !== null}
                                                className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-all hover:border-green-500/50 hover:bg-green-500/20 disabled:opacity-50"
                                            >
                                                {generatingImage === scenario.id ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🎨</span>
                                                        <span>Generate Image</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Video Section */}
                                    <div className="mt-4 border-t border-gray-800 pt-4">
                                        <h4 className="mb-2 text-sm font-semibold text-white">Video</h4>
                                        {scenarioVideos[scenario.id] ? (
                                            <div className="space-y-2">
                                                <video
                                                    src={scenarioVideos[scenario.id].url}
                                                    controls
                                                    className="w-full rounded-lg border border-gray-700"
                                                />
                                                <p className="text-xs text-gray-600">Generated by {scenarioVideos[scenario.id].generatedBy}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => generateScenarioVideo(scenario.id)}
                                                disabled={generatingVideo !== null}
                                                className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/20 disabled:opacity-50"
                                            >
                                                {generatingVideo === scenario.id ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🎬</span>
                                                        <span>Generate Video (8s)</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
