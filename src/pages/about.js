import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Eye, Brain, Zap, Globe, Cpu, Lock, Target,
  Search, AlertTriangle, Activity, Mail, Users, Award,
  TrendingUp, Sparkles, Layers, Database, Cloud,
  CheckCircle, ArrowRight, ExternalLink
} from 'lucide-react';
import './aboutt.css';
import Navbar from './navbar';

const About = () => {
  /* ----------------------------------------------------------------
     ❶ Enhanced animated counters with better formatting
  ---------------------------------------------------------------- */
  const [counters, setCounters] = useState({
    threats: 0,
    images: 0,
    accuracy: 0,
    enterprises: 0
  });

  useEffect(() => {
    const targets = { 
      threats: 750000, 
      images: 25000000, 
      accuracy: 99.7, 
      enterprises: 500 
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
        }
      });
    });

    const heroSection = document.querySelector('.hero-stats');
    if (heroSection) observer.observe(heroSection);

    const animateCounters = () => {
      const duration = 2500;
      const steps = 60;
      const stepTime = duration / steps;

      Object.keys(targets).forEach(key => {
        let current = 0;
        const increment = targets[key] / steps;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= targets[key]) {
            current = targets[key];
            clearInterval(timer);
          }
          
          setCounters(prev => ({
            ...prev,
            [key]: key === 'accuracy' 
              ? parseFloat(current.toFixed(1))
              : Math.floor(current)
          }));
        }, stepTime);
      });
    };

    return () => observer.disconnect();
  }, []);

  /* ----------------------------------------------------------------
     ❷ Enhanced eye tracking with smooth interpolation
  ---------------------------------------------------------------- */
  const eyeRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const eyePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (!eyeRef.current) return;
      
      const rect = eyeRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const targetAngle = Math.atan2(
        mousePos.current.y - centerY,
        mousePos.current.x - centerX
      );
      
      // Smooth interpolation
      const lerpFactor = 0.1;
      eyePos.current.x += (Math.cos(targetAngle) - eyePos.current.x) * lerpFactor;
      eyePos.current.y += (Math.sin(targetAngle) - eyePos.current.y) * lerpFactor;
      
      const finalAngle = Math.atan2(eyePos.current.y, eyePos.current.x);
      eyeRef.current.style.transform = `translate(-50%, -50%) rotate(${finalAngle}rad)`;
      
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animate();

    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* ----------------------------------------------------------------
     ❸ Enhanced tabs with smooth transitions
  ---------------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState('mission');
  const [tabTransition, setTabTransition] = useState(false);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    
    setTabTransition(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTabTransition(false);
    }, 150);
  };

  const navigationTabs = [
    { 
      id: 'mission', 
      label: 'Our Mission', 
      icon: Target,
      description: 'Pioneering digital security through AI innovation'
    },
    { 
      id: 'technology', 
      label: 'Technology Stack', 
      icon: Cpu,
      description: 'Cutting-edge AI models and enterprise architecture'
    },
    { 
      id: 'features', 
      label: 'Core Capabilities', 
      icon: Zap,
      description: 'Four specialized AI modules for comprehensive security'
    },
    { 
      id: 'impact', 
      label: 'Global Impact', 
      icon: Globe,
      description: 'Transforming digital security across industries'
    }
  ];

  /* ----------------------------------------------------------------
     ❹ Enhanced static data with more professional content
  ---------------------------------------------------------------- */
  const achievements = [
    {
      icon: Award,
      title: '99.7% Detection Accuracy',
      description: 'Industry-leading precision in deepfake detection',
      metric: '99.7%',
      context: 'Accuracy Rate'
    },
    {
      icon: Globe,
      title: 'Fortune 500 Adoption',
      description: 'Trusted by leading enterprises worldwide',
      metric: '500+',
      context: 'Enterprise Clients'
    },
    {
      icon: Shield,
      title: 'Zero Security Breaches',
      description: 'Uncompromised security track record',
      metric: '0',
      context: 'Security Incidents'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Processing',
      description: 'Sub-millisecond analysis capabilities',
      metric: '<100ms',
      context: 'Processing Time'
    }
  ];

  const technologyStack = [
    {
      category: 'AI & Machine Learning',
      icon: Brain,
      technologies: [
        { name: 'YOLOv8 Ultra', description: 'Advanced object detection' },
        { name: 'Transformer Networks', description: 'Attention-based analysis' },
        { name: 'Dlib CNN', description: 'Facial recognition engine' },
        { name: 'Custom ELA Models', description: 'Error level analysis' }
      ]
    },
    {
      category: 'Infrastructure & Processing',
      icon: Cpu,
      technologies: [
        { name: 'NVIDIA A100 GPUs', description: 'High-performance computing' },
        { name: 'Edge Computing', description: 'Distributed processing' },
        { name: 'WebSocket Streaming', description: 'Real-time data flow' },
        { name: 'Kubernetes Orchestration', description: 'Scalable deployment' }
      ]
    },
    {
      category: 'Security & Privacy',
      icon: Lock,
      technologies: [
        { name: 'End-to-End Encryption', description: 'AES-256 protection' },
        { name: 'Differential Privacy', description: 'Privacy-preserving ML' },
        { name: 'Zero-Knowledge Proofs', description: 'Verified computation' },
        { name: 'GDPR Compliance', description: 'Regulatory adherence' }
      ]
    },
    {
      category: 'Data & Analytics',
      icon: Database,
      technologies: [
        { name: 'TensorFlow Extended', description: 'ML pipeline platform' },
        { name: 'Apache Kafka', description: 'Event streaming' },
        { name: 'ElasticSearch', description: 'Real-time search' },
        { name: 'Prometheus Monitoring', description: 'System observability' }
      ]
    }
  ];

  const coreFeatures = [
    {
      icon: AlertTriangle,
      color: 'red',
      title: 'Manipulation Detection',
      description: 'Advanced deepfake and content authenticity verification using multi-modal AI analysis',
      capabilities: [
        'Real-time deepfake detection',
        'Error Level Analysis (ELA)',
        'Metadata forensics',
        'Temporal consistency analysis'
      ],
      accuracy: '99.7%',
      processingTime: '< 2s'
    },
    {
      icon: Target,
      color: 'blue',
      title: 'Multi-Camera Surveillance',
      description: 'Intelligent object tracking across multiple camera feeds with Socket.IO integration',
      capabilities: [
        'Cross-camera tracking',
        'Real-time notifications',
        'Behavioral analysis',
        'Zone-based monitoring'
      ],
      accuracy: '98.9%',
      processingTime: '< 100ms'
    },
    {
      icon: Search,
      color: 'purple',
      title: 'Zero-Shot Logo Detection',
      description: 'Brand logo recognition in video content without requiring prior training data',
      capabilities: [
        'Instant logo recognition',
        'Brand compliance monitoring',
        'Similarity scoring',
        'Batch processing'
      ],
      accuracy: '97.8%',
      processingTime: '< 1s'
    },
    {
      icon: Shield,
      color: 'green',
      title: 'Privacy Protection Suite',
      description: 'Enterprise-grade anonymization using multiple AI models for comprehensive privacy',
      capabilities: [
        'Face anonymization',
        'License plate masking',
        'Text redaction',
        'Custom protection zones'
      ],
      accuracy: '99.9%',
      processingTime: '< 500ms'
    }
  ];

  const globalImpact = [
    {
      icon: Users,
      title: 'Enterprise Adoption',
      stat: '500+',
      description: 'Fortune 500 companies trust God\'s Eye for their security needs',
      trend: '+127% YoY growth'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      stat: '50+',
      description: 'Countries actively using our AI security platform',
      trend: 'Expanding to APAC'
    },
    {
      icon: Shield,
      title: 'Threats Neutralized',
      stat: '750K+',
      description: 'Security threats detected and prevented',
      trend: '24/7 monitoring'
    },
    {
      icon: Activity,
      title: 'Processing Volume',
      stat: '25M+',
      description: 'Images and videos analyzed monthly',
      trend: 'Real-time processing'
    }
  ];

  return (
    <div className="about-container">
      <Navbar />

      {/* Enhanced animated background */}
      <div className="about-animated-background">
        <div className="neural-network">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`neural-node node-${i}`} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`neural-connection connection-${i}`} />
          ))}
        </div>
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="badge-icon" />
            <span>Enterprise AI Security Platform</span>
            <div className="badge-glow"></div>
          </div>

          <h1 className="hero-title">
            Redefining Digital&nbsp;
            <span className="gradient-text">Security</span>
            <br />
            <span className="subtitle-accent">Through AI Innovation</span>
          </h1>

          <p className="hero-description">
            God's Eye represents the pinnacle of AI-powered security technology, 
            combining advanced computer vision, machine learning, and real-time 
            processing to deliver unmatched protection against digital threats.
          </p>

          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">
                {counters.threats.toLocaleString()}
                <span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Threats Neutralized</div>
              <div className="stat-trend">↗ +23% this quarter</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {counters.images.toLocaleString()}
                <span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Images Analyzed</div>
              <div className="stat-trend">↗ Real-time processing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {counters.accuracy}
                <span className="stat-suffix">%</span>
              </div>
              <div className="stat-label">Detection Accuracy</div>
              <div className="stat-trend">↗ Industry leading</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {counters.enterprises.toLocaleString()}
                <span className="stat-suffix">+</span>
              </div>
              <div className="stat-label">Enterprise Clients</div>
              <div className="stat-trend">↗ Fortune 500 trusted</div>
            </div>
          </div>
        </div>

        {/* Enhanced AI Brain Visual */}
        <div className="hero-visual">
          <div className="ai-brain-container">
            <div className="ai-brain">
              <div className="brain-core">
                <Eye className="core-icon" ref={eyeRef} />
                <div className="core-pulse"></div>
              </div>
              <div className="brain-rings">
                <div className="ring ring-1">
                  <div className="ring-particles">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`particle particle-${i}`} />
                    ))}
                  </div>
                </div>
                <div className="ring ring-2">
                  <div className="ring-particles">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className={`particle particle-${i}`} />
                    ))}
                  </div>
                </div>
                <div className="ring ring-3">
                  <div className="ring-particles">
                    {[...Array(32)].map((_, i) => (
                      <div key={i} className={`particle particle-${i}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="neural-connections">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`neural-pulse pulse-${i}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Navigation */}
      <section className="content-navigation">
        <div className="nav-container">
          <div className="nav-tabs">
            {navigationTabs.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => handleTabChange(id)}
              >
                <div className="tab-icon-wrapper">
                  <Icon className="tab-icon" />
                </div>
                <div className="tab-content">
                  <span className="tab-label">{label}</span>
                  <span className="tab-description">{description}</span>
                </div>
                {activeTab === id && <div className="tab-indicator" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Main Content */}
      <section className="main-content">
        <div className="content-container">
          <div className={`content-wrapper ${tabTransition ? 'transitioning' : ''}`}>

            {activeTab === 'mission' && (
              <div className="content-section mission-section">
                <div className="section-header">
                  <h2>Our Mission</h2>
                  <p>Pioneering the future of digital security through revolutionary AI technology</p>
                </div>

                <div className="achievements-grid">
                  {achievements.map((achievement, idx) => (
                    <div key={idx} className="achievement-card">
                      <div className="achievement-header">
                        <div className="achievement-icon">
                          <achievement.icon className="icon" />
                        </div>
                        <div className="achievement-metric">
                          <span className="metric-value">{achievement.metric}</span>
                          <span className="metric-context">{achievement.context}</span>
                        </div>
                      </div>
                      <div className="achievement-content">
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mission-statement">
                  <div className="statement-content">
                    <h3>Transforming Digital Security</h3>
                    <p>
                      At God's Eye, we believe that advanced AI should be accessible, reliable, and ethical. 
                      Our mission is to create a safer digital world by providing cutting-edge security 
                      solutions that protect individuals, organizations, and societies from emerging threats.
                    </p>
                    <div className="mission-pillars">
                      <div className="pillar">
                        <CheckCircle className="pillar-icon" />
                        <span>Innovation Excellence</span>
                      </div>
                      <div className="pillar">
                        <CheckCircle className="pillar-icon" />
                        <span>Ethical AI Development</span>
                      </div>
                      <div className="pillar">
                        <CheckCircle className="pillar-icon" />
                        <span>Enterprise-Grade Security</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'technology' && (
              <div className="content-section technology-section">
                <div className="section-header">
                  <h2>Technology Stack</h2>
                  <p>Built on enterprise-grade infrastructure with cutting-edge AI models</p>
                </div>

                <div className="tech-grid">
                  {technologyStack.map((category, idx) => (
                    <div key={idx} className="tech-category">
                      <div className="category-header">
                        <div className="category-icon">
                          <category.icon className="icon" />
                        </div>
                        <h3>{category.category}</h3>
                      </div>
                      <div className="tech-list">
                        {category.technologies.map((tech, techIdx) => (
                          <div key={techIdx} className="tech-item">
                            <div className="tech-name">{tech.name}</div>
                            <div className="tech-description">{tech.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="content-section features-section">
                <div className="section-header">
                  <h2>Core AI Capabilities</h2>
                  <p>Four specialized modules delivering comprehensive security coverage</p>
                </div>

                <div className="features-grid">
                  {coreFeatures.map((feature, idx) => (
                    <div key={idx} className={`feature-card ${feature.color}`}>
                      <div className="feature-header">
                        <div className="feature-icon">
                          <feature.icon className="icon" />
                        </div>
                        <div className="feature-metrics">
                          <div className="metric">
                            <span className="metric-value">{feature.accuracy}</span>
                            <span className="metric-label">Accuracy</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{feature.processingTime}</span>
                            <span className="metric-label">Processing</span>
                          </div>
                        </div>
                      </div>
                      <div className="feature-content">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        <div className="feature-capabilities">
                          {feature.capabilities.map((capability, capIdx) => (
                            <div key={capIdx} className="capability">
                              <CheckCircle className="capability-icon" />
                              <span>{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="content-section impact-section">
                <div className="section-header">
                  <h2>Global Impact</h2>
                  <p>Transforming digital security across industries and continents</p>
                </div>

                <div className="impact-grid">
                  {globalImpact.map((impact, idx) => (
                    <div key={idx} className="impact-card">
                      <div className="impact-icon">
                        <impact.icon className="icon" />
                      </div>
                      <div className="impact-content">
                        <div className="impact-stat">{impact.stat}</div>
                        <h3>{impact.title}</h3>
                        <p>{impact.description}</p>
                        <div className="impact-trend">{impact.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="impact-showcase">
                  <h3>Industry Recognition</h3>
                  <div className="recognition-items">
                    <div className="recognition-item">
                      <Award className="recognition-icon" />
                      <div>
                        <h4>AI Excellence Award 2024</h4>
                        <p>Best Enterprise AI Security Platform</p>
                      </div>
                    </div>
                    <div className="recognition-item">
                      <Globe className="recognition-icon" />
                      <div>
                        <h4>Global Tech Innovation</h4>
                        <p>Featured at World Economic Forum</p>
                      </div>
                    </div>
                    <div className="recognition-item">
                      <Shield className="recognition-icon" />
                      <div>
                        <h4>Security Excellence</h4>
                        <p>ISO 27001 & SOC 2 Type II Certified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Enhanced Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-content">
            <h2>Partner With Us</h2>
            <p>
              Ready to revolutionize your digital security? Let's discuss how 
              God's Eye can protect your organization's most valuable assets.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <Mail className="contact-icon" />
                <div className="contact-details">
                  <span className="contact-label">Enterprise Inquiries</span>
                  <span className="contact-value">aritra.dhar.it27@heritageedu.in</span>
                </div>
              </div>
            </div>
            <div className="contact-cta">
              <button className="cta-button">
                <span>Schedule Demo</span>
                <ArrowRight className="cta-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="component-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} God's Eye. All rights reserved.</p>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
