import React, { useEffect, useRef, useState } from "react";
import {
  Shield, Eye, Search, AlertTriangle, ChevronRight, 
  Zap, Brain, Globe, Lock, Target, Cpu, Star,
  Users, Award, TrendingUp, CheckCircle, Play,
  ArrowRight, Database, Network, BarChart, Sparkles,
  Layers, Activity, Rocket
} from "lucide-react";
import Navbar from "./navbar";
import "./landing.css";

const DynamicParticles = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      hue: Math.random() * 80 + 200,
      pulse: Math.random() * Math.PI * 2
    }));
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Dynamic connections with color variation
        particles.forEach((other, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
            );
            if (distance < 120) {
              const opacity = 0.4 * (1 - distance / 120);
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );
              gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${opacity})`);
              gradient.addColorStop(1, `hsla(${other.hue}, 80%, 70%, ${opacity})`);
              
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
        
        // FIX: Ensure pulseSize is never negative
        const pulseSize = Math.max(0.5, particle.size + Math.sin(particle.pulse) * 2);
        const glowRadius = Math.max(1, pulseSize * 4);
        
        // Outer glow - FIX: Ensure both radii are positive
        if (glowRadius > 0) {
          const glowGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowRadius
          );
          glowGradient.addColorStop(0, `hsla(${particle.hue}, 90%, 80%, ${particle.opacity * 0.8})`);
          glowGradient.addColorStop(0.5, `hsla(${particle.hue}, 90%, 70%, ${particle.opacity * 0.4})`);
          glowGradient.addColorStop(1, `hsla(${particle.hue}, 90%, 60%, 0)`);
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Core particle - FIX: Ensure pulseSize is positive
        if (pulseSize > 0) {
          ctx.fillStyle = `hsla(${particle.hue}, 95%, 85%, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="particle-canvas" />;
};


const GlowText = ({ children, className = "" }) => (
  <div className={`glow-text ${className}`}>
    {children}
  </div>
);

const features = [
  {
    title: "AI Deepfake Detection",
    subtitle: "Neural Forensics Engine",
    desc: "Military-grade deepfake detection with quantum neural networks. Analyze facial micro-expressions and temporal inconsistencies with breakthrough 99.9% accuracy.",
    icon: <AlertTriangle size={32} strokeWidth={2.5} />,
    gradient: "linear-gradient(135deg, #ff4081 0%, #ff6ec7 50%, #ffa726 100%)",
    bgGlow: "rgba(255, 64, 129, 0.2)",
    color: "#ff4081",
    metrics: ["99.9% Accuracy", "0.1s Analysis", "Real-time"],
    demo: "deepfake-demo.mp4"
  },
  {
    title: "Multi-Camera Fusion",
    subtitle: "Omnipresent Intelligence",
    desc: "Track unlimited objects across infinite camera feeds using advanced AI. Seamless handoffs between zones with predictive behavior analysis.",
    icon: <Eye size={32} strokeWidth={2.5} />,
    gradient: "linear-gradient(135deg, #00bcd4 0%, #03a9f4 50%, #2196f3 100%)",
    bgGlow: "rgba(0, 188, 212, 0.2)",
    color: "#00bcd4",
    metrics: ["∞ Cameras", "Zero Latency", "Predictive AI"],
    demo: "tracking-demo.mp4"
  },
  {
    title: "Zero-Shot Recognition",
    subtitle: "Universal AI Vision",
    desc: "Revolutionary foundation model that understands any visual concept instantly. Find logos, objects, or patterns using breakthrough semantic search.",
    icon: <Search size={32} strokeWidth={2.5} />,
    gradient: "linear-gradient(135deg, #9c27b0 0%, #e91e63 50%, #ff5722 100%)",
    bgGlow: "rgba(156, 39, 176, 0.2)",
    color: "#9c27b0",
    metrics: ["Any Object", "Zero Training", "Instant Results"],
    demo: "recognition-demo.mp4"
  },
  {
    title: "Privacy Fortress",
    subtitle: "Quantum Anonymization",
    desc: "Enterprise-grade privacy protection using multi-modal AI. Automatically detect and redact sensitive information with military-level security.",
    icon: <Shield size={32} strokeWidth={2.5} />,
    gradient: "linear-gradient(135deg, #4caf50 0%, #8bc34a 50%, #cddc39 100%)",
    bgGlow: "rgba(76, 175, 80, 0.2)",
    color: "#4caf50",
    metrics: ["GDPR Ready", "Auto-Redaction", "Military Grade"],
    demo: "privacy-demo.mp4"
  }
];

const stats = [
  { 
    icon: <Target size={28} />, 
    value: "99.9%", 
    label: "Accuracy Rate", 
    subtext: "Industry Leading",
    color: "#ff4081",
    trend: "+2.3%"
  },
  { 
    icon: <Zap size={28} />, 
    value: "0.1s", 
    label: "Response Time", 
    subtext: "Lightning Fast",
    color: "#00bcd4",
    trend: "-50%"
  },
  { 
    icon: <Rocket size={28} />, 
    value: "10M+", 
    label: "Images Analyzed", 
    subtext: "Daily Processing",
    color: "#9c27b0",
    trend: "+300%"
  },
  { 
    icon: <Award size={28} />, 
    value: "500+", 
    label: "Enterprise Clients", 
    subtext: "Global Trust",
    color: "#4caf50",
    trend: "Growing"
  }
];

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Chief AI Officer",
    company: "TechCorp Global",
    content: "God's Eye revolutionized our security infrastructure. The visual intelligence is absolutely mind-blowing - it's like having superpowers.",
    rating: 5,
    avatar: "SC",
    color: "#ff4081"
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Security", 
    company: "Defense Solutions",
    content: "Unprecedented accuracy and speed. This isn't just software - it's the future of visual intelligence made real.",
    rating: 5,
    avatar: "MR",
    color: "#00bcd4"
  },
  {
    name: "Emily Watson",
    role: "Director of Privacy",
    company: "HealthTech Innovations",
    content: "The privacy protection is phenomenal. We can finally balance security with compliance without compromise.",
    rating: 5,
    avatar: "EW",
    color: "#9c27b0"
  }
];

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-root">
      <DynamicParticles />
      <Navbar />
      
      {/* Dynamic mouse-following gradient */}
      <div 
        className="mouse-gradient"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(255, 64, 129, 0.1) 0%, 
            rgba(0, 188, 212, 0.08) 40%, 
            rgba(156, 39, 176, 0.06) 70%, 
            transparent 100%)`
        }}
      />

      {/* Vibrant Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-effects">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="gradient-orb orb-4"></div>
          <div className="floating-elements">
           
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={18} />
            <span>Next-Gen AI Platform</span>
            <div className="badge-pulse"></div>
          </div>
          
          <GlowText className="hero-title">
            GOD'S EYE
          </GlowText>
          
          <h2 className="hero-subtitle">
            Revolutionary <span className="rainbow-text">AI Vision</span>  Platform
            <div className="subtitle-glow"></div>
          </h2>
          
          <p className="hero-description">
            Transform reality with breakthrough AI technology that sees beyond human perception. 
            Detect deepfakes with <strong className="highlight-stat">99.9% accuracy</strong>, 
            track objects across <strong className="highlight-stat">unlimited cameras</strong>, 
            and protect privacy with <strong className="highlight-stat">military-grade</strong> security.
          </p>
          
          <div className="hero-actions">
            <button className="cta-primary modern">
              <div className="button-bg"></div>
              <Rocket size={20} />
              <span>Experience the Future</span>
              <div className="button-shine"></div>
            </button>
            <button className="cta-secondary modern">
              <Play size={18} />
              <span>Watch Demo</span>
              <ChevronRight size={16} />
              <div className="button-ripple"></div>
            </button>
          </div>
          
          {/* Animated Stats */}
          <div className="hero-stats modern">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card modern" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="stat-bg" style={{ background: `${stat.color}20` }}></div>
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                  <div className="icon-ring" style={{ borderColor: `${stat.color}40` }}></div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stat.value}
                    <span className="stat-trend" style={{ color: stat.color }}>{stat.trend}</span>
                  </div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-subtext">{stat.subtext}</div>
                </div>
                <div className="stat-glow" style={{ background: `${stat.color}30` }}></div>
              </div>
            ))}
          </div>

          {/* Trust Section with Animation */}
          <div className="trust-section modern">
            <p className="trust-label">
              <Globe size={16} />
              Trusted by innovators worldwide
            </p>
            <div className="trust-companies">
              {["Microsoft", "Tesla", "NVIDIA", "OpenAI", "Meta", "Google"].map((company, idx) => (
                <div key={idx} className="company-badge" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="features-section modern">
        <div className="section-header modern">
          <div className="section-badge modern">
            <Layers size={16} />
            Revolutionary Capabilities
          </div>
          <GlowText className="section-title">
            Four Pillars of AI Supremacy
          </GlowText>
          <p className="section-subtitle modern">
            Experience the next evolution in visual intelligence with our breakthrough AI modules
          </p>
          <div className="header-decoration">
            <div className="decoration-line"></div>
            <Activity className="decoration-icon" />
            <div className="decoration-line"></div>
          </div>
        </div>
        
        <div className="features-grid modern">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className={`feature-card modern ${hoveredCard === idx ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                animationDelay: `${idx * 0.2}s`,
                '--feature-color': feature.color
              }}
            >
              <div className="card-bg-effect" style={{ background: feature.bgGlow }}></div>
              <div className="card-border-glow"></div>
              
              <div className="card-header modern">
                <div 
                  className="card-icon modern"
                  style={{ background: feature.gradient }}
                >
                  {feature.icon}
                  <div className="icon-particles">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="particle" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
                <div className="card-title-group">
                  <h4 className="card-title modern">{feature.title}</h4>
                  <span className="card-subtitle modern">{feature.subtitle}</span>
                </div>
              </div>
              
              <p className="card-description modern">{feature.desc}</p>
              
              <div className="card-metrics modern">
                {feature.metrics.map((metric, i) => (
                  <span key={i} className="metric-badge modern">
                    <div className="metric-dot" style={{ background: feature.color }}></div>
                    {metric}
                  </span>
                ))}
              </div>
              
              <div className="card-footer modern">
                <button className="demo-btn modern" style={{ '--btn-color': feature.color }}>
                  <Play size={16} />
                  <span>View Demo</span>
                  <div className="btn-glow"></div>
                </button>
                <button className="learn-more modern">
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Tech Showcase */}
      <section className="tech-showcase modern">
        <div className="tech-container modern">
          <div className="tech-visual modern">
            <div className="hologram-display">
              <div className="scanning-grid"></div>
              <div className="data-streams">
                {Array.from({ length: 25 }, (_, i) => (
                  <div 
                    key={i} 
                    className="data-stream"
                    style={{ 
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      '--stream-color': `hsl(${200 + Math.random() * 60}, 80%, 70%)`
                    }}
                  />
                ))}
              </div>
              <div className="neural-core">
                <Brain size={60} />
                <div className="core-orbits">
                  <div className="orbit orbit-1"></div>
                  <div className="orbit orbit-2"></div>
                  <div className="orbit orbit-3"></div>
                </div>
                <div className="energy-pulses">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="energy-pulse" style={{ transform: `rotate(${i * 45}deg)` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="tech-content modern">
            <h3 className="tech-title modern">Quantum-Enhanced Processing</h3>
            <p className="tech-description">
              Experience the power of quantum-inspired AI architecture that processes visual data 
              at unprecedented speeds. Our breakthrough neural networks deliver superhuman accuracy 
              with lightning-fast performance.
            </p>
            
            <div className="tech-metrics modern">
              <div className="metric-item modern">
                <div className="metric-icon" style={{ color: '#ff4081' }}>
                  <Database size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-value">1.5 PB/s</div>
                  <div className="metric-label">Processing Speed</div>
                </div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ background: '#ff4081', width: '95%' }}></div>
                </div>
              </div>
              
              <div className="metric-item modern">
                <div className="metric-icon" style={{ color: '#00bcd4' }}>
                  <Network size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-value">750B+</div>
                  <div className="metric-label">AI Parameters</div>
                </div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ background: '#00bcd4', width: '88%' }}></div>
                </div>
              </div>
              
              <div className="metric-item modern">
                <div className="metric-icon" style={{ color: '#9c27b0' }}>
                  <BarChart size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-value">99.97%</div>
                  <div className="metric-label">Accuracy Rate</div>
                </div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ background: '#9c27b0', width: '99%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Testimonials */}
      <section className="testimonials-section modern">
        <div className="section-header modern">
          <h3 className="testimonials-title">What Visionaries Say</h3>
          <p>Revolutionary feedback from industry pioneers</p>
        </div>
        
        <div className="testimonial-carousel modern">
          <div className="testimonial-wrapper">
            <div className="testimonial-card modern" style={{ '--accent-color': testimonials[currentTestimonial].color }}>
              <div className="card-aurora"></div>
              <div className="testimonial-content modern">
                <div className="quote-symbol">"</div>
                <p>{testimonials[currentTestimonial].content}</p>
                <div className="rating modern">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>
              <div className="testimonial-author modern">
                <div 
                  className="author-avatar"
                  style={{ background: testimonials[currentTestimonial].color }}
                >
                  {testimonials[currentTestimonial].avatar}
                  <div className="avatar-glow" style={{ background: testimonials[currentTestimonial].color }}></div>
                </div>
                <div className="author-info">
                  <h5>{testimonials[currentTestimonial].name}</h5>
                  <p>{testimonials[currentTestimonial].role}</p>
                  <span>{testimonials[currentTestimonial].company}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="carousel-controls modern">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`control-dot ${currentTestimonial === idx ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(idx)}
                style={{ '--dot-color': testimonials[idx].color }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="final-cta modern">
        <div className="cta-bg-effects">
          <div className="cta-gradient"></div>
          <div className="floating-shapes">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="floating-shape" style={{ animationDelay: `${i * 0.3}s` }}></div>
            ))}
          </div>
        </div>
        
        <div className="cta-content modern">
          <h3 className="cta-title">Ready to Transform Reality?</h3>
          <p className="cta-description">
            Join the AI revolution and experience visual intelligence like never before. 
            The future of security and surveillance starts now.
          </p>
          
          <div className="cta-actions modern">
            <button className="cta-primary massive">
              <div className="btn-bg-effect"></div>
              <Rocket size={24} />
              <span>Start Your Journey</span>
              <div className="btn-particles">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="btn-particle" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </button>
            <button className="cta-secondary massive">
              <span>Schedule Demo</span>
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="cta-stats modern">
            <div className="stat-bubble">
              <div className="bubble-value">1M+</div>
              <div className="bubble-label">Happy Users</div>
            </div>
            <div className="stat-bubble">
              <div className="bubble-value">99.9%</div>
              <div className="bubble-label">Uptime</div>
            </div>
            <div className="stat-bubble">
              <div className="bubble-value">24/7</div>
              <div className="bubble-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="modern-footer">
        <div className="footer-container modern">
          <div className="footer-main modern">
            <div className="footer-brand modern">
              <h4>GOD'S EYE</h4>
              <p>Redefining Visual Intelligence</p>
              <div className="brand-badges">
                <span className="badge modern">AI Pioneer</span>
                <span className="badge modern">Enterprise Ready</span>
                <span className="badge modern">Quantum Powered</span>
              </div>
            </div>
            <div className="footer-links modern">
              <div className="link-group">
                <h5>Platform</h5>
                <a href="#features">Features</a>
                <a href="#demo">Live Demo</a>
                <a href="#pricing">Pricing</a>
                <a href="#enterprise">Enterprise</a>
              </div>
              <div className="link-group">
                <h5>Resources</h5>
                <a href="#docs">Documentation</a>
                <a href="#api">API Reference</a>
                <a href="#guides">Guides</a>
                <a href="#blog">Blog</a>
              </div>
              <div className="link-group">
                <h5>Company</h5>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#press">Press</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom modern">
            <p>&copy; {new Date().getFullYear()} God's Eye — Powered by Quantum AI</p>
            <div className="footer-social">
              <div className="social-link">Twitter</div>
              <div className="social-link">LinkedIn</div>
              <div className="social-link">GitHub</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
