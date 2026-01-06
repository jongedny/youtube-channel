'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const videos = [
    {
      id: 1,
      title: 'Getting Started with Web Development',
      thumbnail: '/video-thumb-1.jpg',
      views: '125K',
      duration: '15:42'
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      thumbnail: '/video-thumb-2.jpg',
      views: '89K',
      duration: '22:15'
    },
    {
      id: 3,
      title: 'Building Modern UI with Tailwind',
      thumbnail: '/video-thumb-3.jpg',
      views: '156K',
      duration: '18:30'
    },
    {
      id: 4,
      title: 'Next.js 14 Complete Guide',
      thumbnail: '/video-thumb-4.jpg',
      views: '203K',
      duration: '28:45'
    },
    {
      id: 5,
      title: 'TypeScript Best Practices',
      thumbnail: '/video-thumb-5.jpg',
      views: '112K',
      duration: '20:10'
    },
    {
      id: 6,
      title: 'Database Design Fundamentals',
      thumbnail: '/video-thumb-6.jpg',
      views: '95K',
      duration: '25:30'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 -z-10" style={{ background: 'var(--gradient-mesh)' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold gradient-text">TechChannel</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-foreground-secondary hover:text-foreground transition-colors">Home</a>
              <a href="#videos" className="text-foreground-secondary hover:text-foreground transition-colors">Videos</a>
              <a href="#about" className="text-foreground-secondary hover:text-foreground transition-colors">About</a>
              <a href="#contact" className="text-foreground-secondary hover:text-foreground transition-colors">Contact</a>
            </div>

            <button className="btn btn-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="section pt-32 pb-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-block px-4 py-2 glass rounded-full text-sm font-medium">
                🎥 Welcome to TechChannel
              </div>
              <h1 className="text-balance">
                Learn to Build
                <span className="gradient-text"> Amazing Things</span>
              </h1>
              <p className="text-xl text-foreground-secondary max-w-lg">
                Join over 500K subscribers learning web development, design, and technology through high-quality tutorials and courses.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#videos" className="btn btn-primary">
                  Watch Videos
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </a>
                <a href="#about" className="btn btn-secondary">
                  Learn More
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold gradient-text">500K+</div>
                  <div className="text-sm text-foreground-tertiary">Subscribers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">250+</div>
                  <div className="text-sm text-foreground-tertiary">Videos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">50M+</div>
                  <div className="text-sm text-foreground-tertiary">Views</div>
                </div>
              </div>
            </div>

            <div className={`relative ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="relative aspect-video rounded-2xl overflow-hidden glass-strong p-4">
                <div className="w-full h-full bg-gradient-primary rounded-xl flex items-center justify-center">
                  <svg className="w-24 h-24 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent rounded-full blur-3xl opacity-50 animate-glow" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-50 animate-glow" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">
              Latest <span className="gradient-text">Videos</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Explore our collection of in-depth tutorials and guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="card group cursor-pointer"
                style={{
                  animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s forwards` : 'none',
                  opacity: isVisible ? 1 : 0
                }}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-primary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs font-medium">
                    {video.duration}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-foreground-tertiary">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {video.views} views
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="btn btn-secondary">
              View All Videos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-2xl glass-strong p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-accent flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Your Name</h3>
                    <p className="text-foreground-secondary">Content Creator & Developer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2>
                About <span className="gradient-text">TechChannel</span>
              </h2>
              <p className="text-lg text-foreground-secondary">
                Hi! I'm passionate about teaching web development and helping developers level up their skills.
                With over 5 years of experience in the industry, I create content that's both educational and practical.
              </p>
              <p className="text-lg text-foreground-secondary">
                My mission is to make complex topics accessible and help you build real-world projects that matter.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="glass p-4 rounded-xl">
                  <div className="text-2xl font-bold gradient-text mb-1">5+</div>
                  <div className="text-sm text-foreground-tertiary">Years Experience</div>
                </div>
                <div className="glass p-4 rounded-xl">
                  <div className="text-2xl font-bold gradient-text mb-1">100+</div>
                  <div className="text-sm text-foreground-tertiary">Courses Created</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">
                Get In <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-xl text-foreground-secondary">
                Have a question or want to collaborate? I'd love to hear from you!
              </p>
            </div>

            <form className="glass-strong p-8 rounded-2xl space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-background-secondary border border-border focus:border-primary outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-background-secondary border border-border focus:border-primary outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-background-secondary border border-border focus:border-primary outline-none transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Send Message
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </div>
                <span className="font-bold gradient-text">TechChannel</span>
              </div>
              <p className="text-sm text-foreground-tertiary">
                Creating quality content for developers worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-foreground-secondary">
                <a href="#home" className="block hover:text-foreground transition-colors">Home</a>
                <a href="#videos" className="block hover:text-foreground transition-colors">Videos</a>
                <a href="#about" className="block hover:text-foreground transition-colors">About</a>
                <a href="#contact" className="block hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-foreground-secondary">
                <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="block hover:text-foreground transition-colors">Courses</a>
                <a href="#" className="block hover:text-foreground transition-colors">Newsletter</a>
                <a href="#" className="block hover:text-foreground transition-colors">Community</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow Me</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-foreground-tertiary">
            <p>© 2024 TechChannel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
