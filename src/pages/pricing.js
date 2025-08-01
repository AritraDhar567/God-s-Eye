import React, { useState } from 'react';
import { 
  CheckCircle, X, Zap, Shield, Eye, Brain,
  Users, Globe, Clock, Star, Crown, Rocket,
  Lock, Activity, Database, Headphones,
  AlertTriangle, Target, Search, Camera
} from 'lucide-react';
import './pricing.css';
import Navbar from './navbar';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfect for individuals and small teams',
      icon: Eye,
      price: { monthly: 0, yearly: 0 },
      originalPrice: null,
      badge: 'Free Forever',
      badgeColor: 'green',
      popular: false,
      description: 'Get started with basic AI security features',
      features: [
        { name: '5 Image/Video analyses per month', included: true },
        { name: 'Basic manipulation detection', included: true },
        { name: 'Standard processing speed', included: true },
        { name: 'Email support (48h response)', included: true },
        { name: 'Web dashboard access', included: true },
        { name: 'Basic privacy protection', included: true },
        { name: 'Community forum access', included: true },
        { name: 'Advanced AI models', included: false },
        { name: 'API access', included: false },
        { name: 'Real-time processing', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom integrations', included: false }
      ],
      cta: 'Get Started Free',
      ctaStyle: 'primary'
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'Advanced AI security for growing businesses',
      icon: Shield,
      price: { monthly: 49, yearly: 39 },
      originalPrice: { monthly: 59, yearly: 49 },
      badge: 'Most Popular',
      badgeColor: 'purple',
      popular: true,
      description: 'Comprehensive AI security suite with advanced features',
      features: [
        { name: '500 Image/Video analyses per month', included: true },
        { name: 'Advanced manipulation detection with ELA', included: true },
        { name: 'Real-time object tracking (5 cameras)', included: true },
        { name: 'Zero-shot logo detection', included: true },
        { name: 'AI privacy protection (faces, plates, text)', included: true },
        { name: 'Priority processing (3x faster)', included: true },
        { name: 'REST API access with 10K calls/month', included: true },
        { name: 'Advanced analytics dashboard', included: true },
       
        { name: 'Bulk File Uploads', included: true },
        { name: 'Multi-user workspace (up to 5 users)', included: true },
        { name: 'Custom model fine-tuning', included: false }
      ],
      cta: 'Start Professional',
      ctaStyle: 'gradient'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: 'Unlimited AI power for large organizations',
      icon: Crown,
      price: { monthly: 199, yearly: 159 },
      originalPrice: { monthly: 249, yearly: 199 },
      badge: 'Best Value',
      badgeColor: 'gold',
      popular: false,
      description: 'Complete AI security platform with enterprise features',
      features: [
        { name: 'Unlimited analyses & processing', included: true },
        { name: 'Enterprise-grade manipulation detection', included: true },
        { name: 'Unlimited camera object tracking', included: true },
       
        { name: 'Complete AI privacy suite with custom models', included: true },
        { name: 'Real-time processing (10x faster)', included: true },
        { name: 'Full API access with unlimited calls', included: true },
        { name: 'Advanced analytics & reporting', included: true },
        { name: '24/7 priority support + dedicated account manager', included: true },
        { name: 'Custom integrations & webhooks', included: true },
        { name: 'Unlimited users & workspaces', included: true },
        { name: 'Bulk File Uploads', included: true },
        { name: 'Custom AI model development', included: true },
       
      ],
      cta: 'Contact Sales',
      ctaStyle: 'premium'
    }
  ];

  const features = [
    {
      category: 'Core AI Features',
      icon: Brain,
      items: [
        'Image/Video Manipulation Detection',
        'Multi-Camera Object Tracking',
        'Zero-Shot Logo Detection',
        'AI Privacy Protection Suite'
      ]
    },
    {
      category: 'Advanced Analytics',
      icon: Activity,
      items: [
        'Real-time Processing Dashboard',
        'Detailed Confidence Scoring',
        'Tampered Region Identification',
        'Advanced Reporting & Insights'
      ]
    },
    {
      category: 'Integration & API',
      icon: Database,
      items: [
        'RESTful API Access',
        'Webhook Notifications',
        'Custom Integrations',
        'SDK for Popular Languages'
      ]
    },
    {
      category: 'Security & Compliance',
      icon: Lock,
      items: [
        'End-to-End Encryption',
        'GDPR Compliance',
        'SOC 2 Type II Certified',
        'Zero-Knowledge Architecture'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, TechCorp',
      company: 'Fortune 500',
      text: 'God\'s Eye has revolutionized our content verification process. The accuracy is phenomenal.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Security Director',
      company: 'Global Security Inc',
      text: 'Real-time object tracking across our facility has never been more reliable and intelligent.',
      rating: 5
    }
  ];

  return (
    <div className="pricing-container">
      <Navbar />
      
      {/* Animated Background */}
      <div className="pricing-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="pricing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap className="badge-icon" />
            <span>AI Security Platform</span>
          </div>
          <h1>God's Eye Software Plans</h1>
          <p className="hero-subtitle">
            From startups to enterprises, we have the perfect AI security solution 
            for your digital protection needs.
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <button 
              className="toggle-switch"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <div className={`toggle-handle ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
            </button>
            <span className={billingCycle === 'yearly' ? 'active' : ''}>
              Yearly <div className="save-badge">Save 20%</div>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-section">
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${hoveredPlan === plan.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.badge && (
                <div className={`plan-badge ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}
              
              <div className="card-header">
                <div className="plan-icon">
                  <plan.icon className="icon" />
                </div>
                <h3>{plan.name}</h3>
                <p className="plan-subtitle">{plan.subtitle}</p>
                
                <div className="pricing-display">
                  {plan.price[billingCycle] === 0 ? (
                    <div className="price-free">Free</div>
                  ) : (
                    <>
                      {plan.originalPrice && (
                        <div className="original-price">
                          ${plan.originalPrice[billingCycle]}
                        </div>
                      )}
                      <div className="current-price">
                        <span className="price">${plan.price[billingCycle]}</span>
                        <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="features-section">
                <ul className="features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={feature.included ? 'included' : 'not-included'}>
                      {feature.included ? (
                        <CheckCircle className="feature-icon included" />
                      ) : (
                        <X className="feature-icon excluded" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`cta-button ${plan.ctaStyle}`}>
                {plan.cta}
                {plan.popular && <Rocket className="cta-icon" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="features-overview">
        <div className="section-header">
          <h2>Complete AI Security Suite</h2>
          <p>Comprehensive protection powered by cutting-edge artificial intelligence</p>
        </div>
        
        <div className="features-grid">
          {features.map((category, index) => (
            <div key={index} className="feature-category">
              <div className="category-header">
                <category.icon className="category-icon" />
                <h3>{category.category}</h3>
              </div>
              <ul className="category-features">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <CheckCircle className="check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Trusted by Industry Leaders</h2>
          <p>See what our customers say about God's Eye AI security platform</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="star filled" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className="author-company">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What AI models power God's Eye?</h4>
            <p>We use state-of-the-art models including YOLO, Dlib CNN, Tesseract OCR, and custom-trained neural networks for maximum accuracy.</p>
          </div>
          <div className="faq-item">
            <h4>Can I upgrade or downgrade my plan?</h4>
            <p>Yes, you can change your plan at any time. Upgrades are effective immediately, and downgrades take effect at your next billing cycle.</p>
          </div>
          <div className="faq-item">
            <h4>Is my data secure?</h4>
            <p>Absolutely. We use end-to-end encryption, zero-knowledge architecture, and are SOC 2 Type II certified for maximum security.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer custom enterprise solutions?</h4>
            <p>Yes, our Enterprise plan includes custom AI model development, on-premise deployment, and dedicated support for large organizations.</p>
          </div>
        </div>
      </section>

      <footer className="component-footer">
        <p>&copy; {new Date().getFullYear()} God's Eye. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Pricing;
