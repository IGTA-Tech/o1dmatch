'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import './employers.css';
import Navbar from '@/components/Navbar';

export default function HowItWorksEmployersPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('fade-visible');
        });
      },
      { threshold: 0.15 }
    );

    requestAnimationFrame(() => {
      const wrapper = document.querySelector('.employer-landing');
      document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
      wrapper?.classList.add('animations-ready');
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="employer-landing">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="el-hero">
        <div className="el-hero-grid-bg" />
        <div className="el-hero-glow-1" />
        <div className="el-hero-glow-2" />

        <div className="el-hero-inner">
          {/* Left */}
          <div className="el-hero-text">
            <div className="el-hero-badge">
              <div className="el-pulse-dot" />
              <span>Now matching O-1 talent across 40+ industries</span>
            </div>

            <h1 className="el-hero-h1">
              Your <em>Extraordinary Ability</em> Deserves an Extraordinary Path
            </h1>

            <p className="el-hero-sub">
              O1DMatch connects O-1 visa holders and applicants with US employers
              actively seeking exceptional international talent. Built by an
              immigration attorney who has seen the gap firsthand.
            </p>

            <div className="el-hero-ctas">
              <Link href="/signup?role=talent" className="el-btn-primary">
                I&apos;m O-1 Talent →
              </Link>
              <Link href="/signup?role=employer" className="el-btn-secondary">
                I&apos;m Hiring O-1 Talent
              </Link>
            </div>

            <div className="el-hero-stats">
              <div className="el-hero-stat">
                <div className="el-stat-num">500+</div>
                <div className="el-stat-label">O-1 Candidates</div>
              </div>
              <div className="el-hero-stat">
                <div className="el-stat-num">120+</div>
                <div className="el-stat-label">Hiring Companies</div>
              </div>
              <div className="el-hero-stat">
                <div className="el-stat-num">98%</div>
                <div className="el-stat-label">Match Accuracy</div>
              </div>
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="el-hero-preview">
            <div className="el-preview-card">
              <div className="el-preview-header">
                <h3>Your O-1 Profile</h3>
                <span className="el-preview-badge">● Active</span>
              </div>

              <div className="el-score-ring">
                <svg viewBox="0 0 120 120">
                  <circle className="el-ring-bg" cx="60" cy="60" r="54" />
                  <circle className="el-ring-fill" cx="60" cy="60" r="54" />
                </svg>
                <div className="el-score-center">
                  <span className="el-score-pct">50%</span>
                  <span className="el-score-lbl">O-1 Score</span>
                </div>
              </div>

              <div className="el-criteria-badge">
                <span>4 of 8 Criteria Met</span>
              </div>

              <div className="el-preview-metrics">
                <div className="el-metric">
                  <div className="el-metric-val">12</div>
                  <div className="el-metric-lbl">Documents</div>
                </div>
                <div className="el-metric">
                  <div className="el-metric-val">7</div>
                  <div className="el-metric-lbl">Matching Jobs</div>
                </div>
                <div className="el-metric">
                  <div className="el-metric-val">3</div>
                  <div className="el-metric-lbl">Letters</div>
                </div>
              </div>
            </div>

            <div className="el-floating-card el-float el-fc-match">
              <div className="el-fc-icon el-fc-icon-green">🎯</div>
              <div className="el-fc-title">New Match!</div>
              <div className="el-fc-sub">Google — ML Engineer</div>
            </div>

            <div className="el-floating-card el-float-delay el-fc-letter">
              <div className="el-fc-icon el-fc-icon-blue">✉️</div>
              <div className="el-fc-title">Interest Letter</div>
              <div className="el-fc-sub">From: Stripe Inc.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="el-section el-section-white">
        <div className="el-section-header fade-up">
          <div className="el-section-tag">How It Works</div>
          <h2 className="el-section-title">
            Three Steps to Your O-1 Opportunity
          </h2>
          <p className="el-section-desc">
            Whether you&apos;re extraordinary talent or an employer seeking it,
            O1DMatch simplifies the journey.
          </p>
        </div>

        <div className="el-steps-grid">
          <div className="el-steps-line" />

          <div className="el-step-card fade-up">
            <div className="el-step-num">1</div>
            <h3>Build Your Profile</h3>
            <p>
              Upload your evidence — awards, publications, memberships — and
              watch your O-1 score grow in real time.
            </p>
          </div>

          <div className="el-step-card fade-up">
            <div className="el-step-num">2</div>
            <h3>Get Matched</h3>
            <p>
              Our algorithm connects you with employers who are specifically
              seeking O-1 talent in your field and expertise.
            </p>
          </div>

          <div className="el-step-card fade-up">
            <div className="el-step-num">3</div>
            <h3>Receive Interest Letters</h3>
            <p>
              Employers send formal sponsorship letters. Accept, sign, and our
              team reviews and facilitates the next steps.
            </p>
          </div>
        </div>
      </section>

      {/* ─── DUAL CTA ─── */}
      <section id="talent" className="el-section el-section-cream">
        <div className="el-section-header fade-up">
          <div className="el-section-tag">Built for Both Sides</div>
          <h2 className="el-section-title">Choose Your Path</h2>
        </div>

        <div className="el-dual-grid" id="employers">
          <div className="el-cta-card el-cta-talent fade-up">
            <div className="el-card-icon el-card-icon-gold">🌟</div>
            <h3>For O-1 Talent</h3>
            <p>
              Track your O-1 eligibility, upload evidence, and connect with
              companies ready to sponsor your visa.
            </p>
            <ul>
              <li>
                <span className="el-check-gold">✓</span> Real-time O-1
                eligibility scoring
              </li>
              <li>
                <span className="el-check-gold">✓</span> AI-powered job matching
              </li>
              <li>
                <span className="el-check-gold">✓</span> Dedicated account
                manager support
              </li>
              <li>
                <span className="el-check-gold">✓</span> Secure document
                management
              </li>
            </ul>
            <Link href="/signup?role=talent" className="el-btn-card-gold">
              Start Your Profile →
            </Link>
          </div>

          <div className="el-cta-card el-cta-employer fade-up">
            <div className="el-card-icon el-card-icon-blue">🏢</div>
            <h3>For Employers</h3>
            <p>
              Access a curated pool of exceptional international professionals
              pre-screened for O-1 eligibility.
            </p>
            <ul>
              <li>
                <span className="el-check-blue">✓</span> Browse pre-vetted O-1
                candidates
              </li>
              <li>
                <span className="el-check-blue">✓</span> Send interest letters
                directly
              </li>
              <li>
                <span className="el-check-blue">✓</span> Post jobs to targeted
                talent pool
              </li>
              <li>
                <span className="el-check-blue">✓</span> Immigration compliance
                support
              </li>
            </ul>
            <Link href="/signup?role=employer" className="el-btn-card-navy">
              Hire O-1 Talent →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section id="trust" className="el-section el-section-white">
        <div className="el-trust-grid">
          <div className="el-trust-content fade-up">
            <div className="el-section-tag el-tag-left">Built on Expertise</div>
            <h2 className="el-trust-title">
              Founded by an Immigration Attorney Who Knows the System
            </h2>
            <p className="el-trust-desc">
              O1DMatch was built by a practicing immigration attorney with years of
              experience handling O-1 visa cases. This isn&apos;t just software —
              it&apos;s the culmination of seeing firsthand how talented individuals
              struggle to find employers willing to sponsor, and how employers miss
              out on extraordinary talent.
            </p>

            <div className="el-trust-features">
              <div className="el-trust-feat">
                <div className="el-tf-icon">⚖️</div>
                <div>
                  <h4>Licensed Attorney</h4>
                  <p>Active bar member with immigration law specialization</p>
                </div>
              </div>
              <div className="el-trust-feat">
                <div className="el-tf-icon">🔒</div>
                <div>
                  <h4>Secure &amp; Compliant</h4>
                  <p>All documents encrypted. Your data stays private.</p>
                </div>
              </div>
              <div className="el-trust-feat">
                <div className="el-tf-icon">🤝</div>
                <div>
                  <h4>Human + Technology</h4>
                  <p>AI-powered matching with human oversight at every step</p>
                </div>
              </div>
            </div>
          </div>

          <div className="el-trust-badges fade-up">
            <div className="el-badge">
              <div className="el-badge-num">500+</div>
              <div className="el-badge-lbl">Candidates Served</div>
            </div>
            <div className="el-badge">
              <div className="el-badge-num">120+</div>
              <div className="el-badge-lbl">Partner Companies</div>
            </div>
            <div className="el-badge">
              <div className="el-badge-num">40+</div>
              <div className="el-badge-lbl">Industries</div>
            </div>
            <div className="el-badge">
              <div className="el-badge-num">15+</div>
              <div className="el-badge-lbl">Years Immigration Exp.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEREST LETTERS ─── */}
      <section className="el-section el-section-cream">
        <div className="el-interest fade-up">
          <div className="el-section-tag">How Sponsorship Works</div>
          <h2 className="el-section-title">About Interest Letters</h2>
          <div className="el-interest-box">
            <p>
              Interest letters are formal expressions of your intent to sponsor or
              hire O-1 talent. When a candidate accepts and signs the letter, our
              admin will review and forward the signed document to you. Contact
              information will be revealed once the signed letter is delivered.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="el-footer">
        <div className="el-footer-inner">
          <div className="el-footer-grid">
            <div className="el-footer-brand">
              <span className="el-footer-logo">O1DMatch</span>
              <p>
                Connecting exceptional talent with opportunities for O-1 visa
                sponsorship.
              </p>
            </div>
            <div className="el-footer-col">
              <h4>Platform</h4>
              <Link href="/how-it-works/talent">For Candidates</Link>
              <Link href="/how-it-works/employers">For Employers</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <div className="el-footer-col">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="el-footer-col">
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>

          <div className="el-footer-bottom">
            <span>© 2026 O1DMatch. All rights reserved.</span>
            <span>Built by a licensed immigration attorney.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}