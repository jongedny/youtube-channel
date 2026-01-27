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

interface CharacterImage {
    id: number;
    characterId: number;
    url: string;
    prompt: string | null;
    approved: boolean;
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
    youtubeId: string | null;
    youtubeUrl: string | null;
    uploadStatus: string | null;
    uploadedAt: Date | null;
    uploadError: string | null;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [scenarioImages, setScenarioImages] = useState<Record<number, ScenarioImage>>({});
    const [characterImages, setCharacterImages] = useState<Record<number, CharacterImage>>({});
    const [scenarioVideos, setScenarioVideos] = useState<Record<number, ScenarioVideo>>({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<'character' | 'scenario' | null>(null);
    const [generatingImage, setGeneratingImage] = useState<number | null>(null);
    const [generatingCharacterImage, setGeneratingCharacterImage] = useState<number | null>(null);
    const [generatingVideo, setGeneratingVideo] = useState<number | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState<number | null>(null);
    const [selectedModel, setSelectedModel] = useState<Record<number, 'gemini' | 'sora'>>({});
    const [youtubeAuthError, setYoutubeAuthError] = useState(false);

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
                const scenarioImageMap: Record<number, ScenarioImage> = {};
                const characterImageMap: Record<number, CharacterImage> = {};
                data.images?.forEach((img: any) => {
                    if (img.scenarioId) {
                        scenarioImageMap[img.scenarioId] = img;
                    }
                    if (img.characterId) {
                        characterImageMap[img.characterId] = img;
                    }
                });
                setScenarioImages(scenarioImageMap);
                setCharacterImages(characterImageMap);
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

    async function generateCharacterImage(characterId: number) {
        setGeneratingCharacterImage(characterId);
        try {
            const res = await fetch('/api/generate/character-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterId })
            });
            if (res.ok) {
                await fetchData();
                alert('✅ Character image generated!');
            } else {
                alert('❌ Failed to generate character image');
            }
        } catch (error) {
            console.error('Error generating character image:', error);
            alert('❌ Error generating character image');
        } finally {
            setGeneratingCharacterImage(null);
        }
    }

    async function updateImageApproval(imageId: number, approved: boolean) {
        try {
            const res = await fetch('/api/update-image-approval', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, approved })
            });
            if (res.ok) {
                await fetchData();
            } else {
                alert('❌ Failed to update approval status');
            }
        } catch (error) {
            console.error('Error updating approval:', error);
            alert('❌ Error updating approval status');
        }
    }

    async function generateScenarioVideo(scenarioId: number, model: 'gemini' | 'sora' = 'gemini') {
        setGeneratingVideo(scenarioId);
        try {
            const res = await fetch('/api/generate/scenario-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenarioId, model })
            });
            if (res.ok) {
                await fetchData();
                const modelName = model === 'sora' ? 'OpenAI Sora' : 'Google Veo';
                alert(`✅ Scenario video generated using ${modelName}! (8 seconds)`);
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

    async function uploadToYouTube(videoId: number, scenarioTitle: string) {
        setUploadingVideo(videoId);
        try {
            const res = await fetch('/api/upload/youtube', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoId,
                    title: `PocketRot: ${scenarioTitle}`,
                    description: 'AI-generated video from the PocketRot universe - where tiny glitched animals tackle mundane missions in a massive human world.',
                    tags: ['PocketRot', 'AI Generated', 'Animation', 'Short Film'],
                    privacyStatus: 'private'
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setYoutubeAuthError(false); // Clear any previous auth errors
                await fetchData();
                alert(`✅ Video uploaded to YouTube!\n\n${data.youtubeUrl}`);
            } else {
                // Check if this is an authentication error
                if (data.isAuthError || res.status === 401) {
                    setYoutubeAuthError(true);
                    alert(`🔐 YouTube authentication expired!\n\nPlease re-authenticate with YouTube to continue uploading videos.`);
                } else {
                    alert(`❌ Failed to upload to YouTube: ${data.error || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Error uploading to YouTube:', error);
            alert('❌ Error uploading to YouTube');
        } finally {
            setUploadingVideo(null);
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
                                        <p className="mb-3 text-xs text-gray-600">{char.backstory}</p>
                                    )}

                                    {/* Character Image Section */}
                                    <div className="mt-4 border-t border-gray-800 pt-4">
                                        {characterImages[char.id] ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={characterImages[char.id].url}
                                                    alt={char.name}
                                                    className="w-full rounded-lg border border-gray-700"
                                                />
                                                <p className="text-xs text-gray-600">Generated by {characterImages[char.id].generatedBy}</p>

                                                {/* Approval Checkbox */}
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={characterImages[char.id].approved}
                                                        onChange={(e) => updateImageApproval(characterImages[char.id].id, e.target.checked)}
                                                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-0"
                                                    />
                                                    <span className={`text-sm ${characterImages[char.id].approved
                                                            ? 'text-green-400 font-medium'
                                                            : 'text-gray-400'
                                                        }`}>
                                                        {characterImages[char.id].approved ? '✅ Approved' : 'Approve design'}
                                                    </span>
                                                </label>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => generateCharacterImage(char.id)}
                                                disabled={generatingCharacterImage !== null}
                                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/20 disabled:opacity-50"
                                            >
                                                {generatingCharacterImage === char.id ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🎨</span>
                                                        <span>Generate Character Image</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
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
                                            <div className="space-y-3">
                                                <video
                                                    src={scenarioVideos[scenario.id].url}
                                                    controls
                                                    className="w-full rounded-lg border border-gray-700"
                                                />
                                                <p className="text-xs text-gray-600">Generated by {scenarioVideos[scenario.id].generatedBy}</p>

                                                {/* YouTube Upload Section */}
                                                <div className="space-y-2">
                                                    {scenarioVideos[scenario.id].uploadStatus === 'completed' && scenarioVideos[scenario.id].youtubeUrl ? (
                                                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                                                            <div className="flex items-center gap-2 text-sm text-green-400">
                                                                <span>✅</span>
                                                                <span className="font-medium">Uploaded to YouTube</span>
                                                            </div>
                                                            <a
                                                                href={scenarioVideos[scenario.id].youtubeUrl!}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-2 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                                                            >
                                                                <span>🔗</span>
                                                                <span className="underline">View on YouTube</span>
                                                            </a>
                                                            {scenarioVideos[scenario.id].uploadedAt && (
                                                                <p className="mt-1 text-xs text-gray-600">
                                                                    Uploaded {new Date(scenarioVideos[scenario.id].uploadedAt!).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : scenarioVideos[scenario.id].uploadStatus === 'failed' ? (
                                                        <div className="space-y-2">
                                                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                                                                <div className="flex items-center gap-2 text-sm text-red-400">
                                                                    <span>❌</span>
                                                                    <span className="font-medium">Upload failed</span>
                                                                </div>
                                                                {scenarioVideos[scenario.id].uploadError && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {scenarioVideos[scenario.id].uploadError}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => uploadToYouTube(scenarioVideos[scenario.id].id, scenario.title)}
                                                                disabled={uploadingVideo !== null}
                                                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-50"
                                                            >
                                                                {uploadingVideo === scenarioVideos[scenario.id].id ? (
                                                                    <>
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                                                        <span>Uploading...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>🔄</span>
                                                                        <span>Retry Upload</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : scenarioVideos[scenario.id].uploadStatus === 'uploading' ? (
                                                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                                                            <div className="flex items-center gap-2 text-sm text-blue-400">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                                                <span className="font-medium">Uploading to YouTube...</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        youtubeAuthError ? (
                                                            <a
                                                                href="/api/youtube/auth"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 transition-all hover:border-yellow-500/50 hover:bg-yellow-500/20"
                                                            >
                                                                <span>🔐</span>
                                                                <span>Re-authenticate YouTube</span>
                                                            </a>
                                                        ) : (
                                                            <button
                                                                onClick={() => uploadToYouTube(scenarioVideos[scenario.id].id, scenario.title)}
                                                                disabled={uploadingVideo !== null}
                                                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-50"
                                                            >
                                                                {uploadingVideo === scenarioVideos[scenario.id].id ? (
                                                                    <>
                                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                                                        <span>Uploading...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>📤</span>
                                                                        <span>Upload to YouTube</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Model Selector */}
                                                <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
                                                    <label className="mb-2 block text-xs font-medium text-gray-400">
                                                        Select AI Model
                                                    </label>
                                                    <select
                                                        value={selectedModel[scenario.id] || 'gemini'}
                                                        onChange={(e) => setSelectedModel(prev => ({
                                                            ...prev,
                                                            [scenario.id]: e.target.value as 'gemini' | 'sora'
                                                        }))}
                                                        className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    >
                                                        <option value="gemini">Google Veo 3.1 (Text-only)</option>
                                                        <option value="sora">OpenAI Sora (Text + Image)</option>
                                                    </select>

                                                    {/* Model Info */}
                                                    <div className="mt-2 rounded-md bg-gray-900/50 p-2">
                                                        {(selectedModel[scenario.id] || 'gemini') === 'gemini' ? (
                                                            <div className="flex items-start gap-2 text-xs text-gray-400">
                                                                <span>ℹ️</span>
                                                                <div>
                                                                    <p className="font-medium text-gray-300">Google Veo 3.1</p>
                                                                    <p>Text-to-video only. Reference images not supported.</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start gap-2 text-xs text-purple-400">
                                                                <span>✨</span>
                                                                <div>
                                                                    <p className="font-medium text-purple-300">OpenAI Sora</p>
                                                                    <p>Supports reference images for better consistency!</p>
                                                                    {scenarioImages[scenario.id] && (
                                                                        <p className="mt-1 text-green-400">✅ Reference image available</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Generate Button */}
                                                <button
                                                    onClick={() => generateScenarioVideo(scenario.id, selectedModel[scenario.id] || 'gemini')}
                                                    disabled={generatingVideo !== null}
                                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:border-purple-500/50 hover:bg-purple-500/20 disabled:opacity-50"
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
                                            </div>
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
