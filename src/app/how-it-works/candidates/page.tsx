'use client';

import Link from 'next/link';
import { Shield, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useO1DAnimations } from '@/hooks/useO1DAnimations';
import '@/app/theme.css';
import Footer from "@/components/Footer";

export default function HowItWorksCandidatesPage() {
  useO1DAnimations();

  return (
    <div className="o1d-page">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="o1d-hero o1d-hero-sm">
        <div className="o1d-hero-grid" />
        <div className="o1d-hero-glow-1" />
        <div className="o1d-hero-glow-2" />

        <div className="o1d-hero-inner o1d-hero-inner-center">
          <div className="o1d-hero-badge">
            <div className="o1d-pulse-dot" />
            <span>For O-1 Visa Candidates</span>
          </div>

          <h1 className="o1d-hero-h1">
            How O1DMatch Works
            <br />
            <em>For Candidates</em>
          </h1>

          <p className="o1d-hero-sub o1d-hero-sub-center">
            Build your O-1 profile, get matched with employers, and receive
            USCIS-ready interest letters to support your visa petition.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup?role=talent" className="o1d-btn-primary">
              Create Your Free Profile →
            </Link>
            <Link href="/how-it-works/employers" className="o1d-btn-secondary">
              I&apos;m an Employer
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STEP 1: Upload Evidence ─── */}
      <section className="o1d-section o1d-section-white">
        <div className="o1d-step-grid o1d-fade-up">
          {/* Text */}
          <div>
            <div className="o1d-step-badge">Step 1</div>
            <h2 className="o1d-step-heading">Upload Your Evidence</h2>
            <p className="o1d-step-desc">
              Start by uploading documents that prove your extraordinary abilities. Our AI
              automatically classifies each document across the 8 O-1 visa criteria.
            </p>
            <ul className="o1d-checklist">
              {[
                'Awards and recognition certificates',
                'Published articles and media coverage',
                'Patents and original contributions',
                'Membership certificates',
                'Employment contracts showing high salary',
              ].map((item) => (
                <li key={item}>
                  <span className="o1d-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup */}
          <div className="o1d-mock-wrap">
            <div className="o1d-mock-window">
              <div className="o1d-mock-chrome">
                <div className="o1d-mock-dot o1d-mock-dot-r" />
                <div className="o1d-mock-dot o1d-mock-dot-y" />
                <div className="o1d-mock-dot o1d-mock-dot-g" />
                <span className="o1d-mock-title">Evidence Manager</span>
              </div>
              <div className="o1d-mock-body">
                <div style={{
                  border: '2px dashed rgba(212,168,75,0.4)',
                  borderRadius: '12px', padding: '2rem',
                  textAlign: 'center', background: 'rgba(212,168,75,0.04)',
                  marginBottom: '1rem',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                  <p style={{ fontWeight: 600, color: '#0B1D35', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Drop files here or click to upload
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B' }}>PDF, DOC, JPG up to 10MB</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { name: 'award_certificate.pdf', tag: 'Awards' },
                    { name: 'forbes_article.pdf', tag: 'Published Material' },
                  ].map((f) => (
                    <div key={f.name} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem', background: '#FBF8F1', borderRadius: '8px',
                      border: '1px solid #E8E0D4',
                    }}>
                      <span style={{ fontSize: '1.3rem' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0B1D35' }}>{f.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#10B981' }}>Classified: {f.tag}</p>
                      </div>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STEP 2: AI Classification ─── */}
      <section className="o1d-section o1d-section-cream">
        <div className="o1d-step-grid o1d-fade-up">
          {/* Mockup (left on desktop) */}
          <div className="o1d-mock-wrap" style={{ order: 1 }}>
            <div className="o1d-mock-window">
              <div className="o1d-mock-chrome">
                <div className="o1d-mock-dot o1d-mock-dot-r" />
                <div className="o1d-mock-dot o1d-mock-dot-y" />
                <div className="o1d-mock-dot o1d-mock-dot-g" />
                <span className="o1d-mock-title">AI Analysis</span>
              </div>
              <div className="o1d-mock-body">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem',
                  padding: '0.75rem', background: '#FBF8F1', borderRadius: '10px',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0B1D35, #D4A84B)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                  }}>🧠</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0B1D35', fontSize: '0.85rem' }}>Document Analyzed</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>AI has classified your evidence</p>
                  </div>
                </div>
                {[
                  { label: 'Awards', pct: 95, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                  { label: 'Original Contributions', pct: 78, color: '#D4A84B', bg: 'rgba(212,168,75,0.08)' },
                  { label: 'Published Material', pct: 62, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '0.75rem', borderRadius: '8px',
                    background: item.bg, marginBottom: '0.5rem',
                    border: `1px solid ${item.color}22`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0B1D35' }}>{item.label}</span>
                      <span style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600 }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#E2D9C8', borderRadius: '100px' }}>
                      <div style={{ height: '4px', width: `${item.pct}%`, background: item.color, borderRadius: '100px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text (right on desktop) */}
          <div style={{ order: 2 }}>
            <div className="o1d-step-badge">Step 2</div>
            <h2 className="o1d-step-heading">AI Classifies Your Evidence</h2>
            <p className="o1d-step-desc">
              Our AI analyzes each document and automatically classifies it against the
              8 USCIS O-1 criteria. No more guessing which category your evidence belongs to.
            </p>
            <ul className="o1d-checklist">
              {[
                'Instant classification with confidence scores',
                'Suggestions for additional evidence needed',
                'Automatic extraction of key achievements',
                'Multi-criteria matching for versatile documents',
              ].map((item) => (
                <li key={item}><span className="o1d-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── STEP 3: Track Your Score ─── */}
      <section className="o1d-section o1d-section-white">
        <div className="o1d-step-grid o1d-fade-up">
          {/* Text */}
          <div>
            <div className="o1d-step-badge">Step 3</div>
            <h2 className="o1d-step-heading">Track Your O-1 Readiness Score</h2>
            <p className="o1d-step-desc">
              See your real-time O-1 readiness score based on how well your evidence covers
              the required criteria. Know exactly where you stand and what to improve.
            </p>
            <ul className="o1d-checklist">
              {[
                'Visual breakdown of all 8 criteria',
                "See which criteria you've met (need 3+)",
                'Recommendations to improve your score',
                'Compare your profile to successful applicants',
              ].map((item) => (
                <li key={item}><span className="o1d-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>

          {/* Mockup — Dashboard */}
          <div className="o1d-mock-wrap">
            <div className="o1d-mock-window">
              <div className="o1d-mock-chrome">
                <div className="o1d-mock-dot o1d-mock-dot-r" />
                <div className="o1d-mock-dot o1d-mock-dot-y" />
                <div className="o1d-mock-dot o1d-mock-dot-g" />
                <span className="o1d-mock-title">Your Dashboard</span>
              </div>
              <div className="o1d-mock-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                  {/* Score ring */}
                  <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                    <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="48" cy="48" r="40" stroke="#E8E0D4" strokeWidth="7" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#D4A84B" strokeWidth="7" fill="none"
                        strokeDasharray="251.3" strokeDashoffset="62.8" strokeLinecap="round" />
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#0B1D35' }}>75</span>
                      <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Score</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#10B981', fontSize: '0.95rem' }}>Strong Profile</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B' }}>5 of 8 criteria met</p>
                  </div>
                </div>
                {/* Criteria grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {[
                    { name: 'Awards', met: true },
                    { name: 'Memberships', met: true },
                    { name: 'Published Material', met: true },
                    { name: 'Judging', met: false },
                    { name: 'Original Contributions', met: true },
                    { name: 'Scholarly Articles', met: false },
                    { name: 'Critical Role', met: true },
                    { name: 'High Salary', met: false },
                  ].map((c) => (
                    <div key={c.name} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.6rem', borderRadius: '6px',
                      background: c.met ? 'rgba(16,185,129,0.08)' : '#FBF8F1',
                      border: `1px solid ${c.met ? 'rgba(16,185,129,0.2)' : '#E8E0D4'}`,
                    }}>
                      <span style={{ fontSize: '0.7rem', color: c.met ? '#10B981' : '#CBD5E1' }}>✓</span>
                      <span style={{ fontSize: '0.72rem', color: c.met ? '#065F46' : '#94A3B8', fontWeight: c.met ? 600 : 400 }}>
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STEP 4: Get Matched ─── */}
      <section className="o1d-section o1d-section-cream">
        <div className="o1d-step-grid o1d-fade-up">
          {/* Mockup (left) */}
          <div className="o1d-mock-wrap" style={{ order: 1 }}>
            <div className="o1d-mock-window">
              <div className="o1d-mock-chrome">
                <div className="o1d-mock-dot o1d-mock-dot-r" />
                <div className="o1d-mock-dot o1d-mock-dot-y" />
                <div className="o1d-mock-dot o1d-mock-dot-g" />
                <span className="o1d-mock-title">Job Matches</span>
              </div>
              <div className="o1d-mock-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { company: 'TechCorp', role: 'Senior AI Engineer', score: 85, label: 'Excellent' },
                  { company: 'StartupXYZ', role: 'Lead Data Scientist', score: 78, label: 'Great' },
                  { company: 'Innovation Inc', role: 'Research Director', score: 72, label: 'Good' },
                ].map((job) => (
                  <div key={job.company} style={{
                    padding: '0.9rem', borderRadius: '10px',
                    border: '1px solid #E8E0D4', background: '#FDFCFA',
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0B1D35' }}>{job.role}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{job.company}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#10B981' }}>{job.score}%</span>
                        <p style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>{job.label} Match</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(212,168,75,0.12)', color: '#B8862D' }}>O-1 Sponsor</span>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(11,29,53,0.06)', color: '#0B1D35' }}>Remote OK</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text (right) */}
          <div style={{ order: 2 }}>
            <div className="o1d-step-badge">Step 4</div>
            <h2 className="o1d-step-heading">Get Matched with Jobs</h2>
            <p className="o1d-step-desc">
              Browse job listings from employers actively seeking O-1 candidates. See your
              match score for each position based on your profile and their requirements.
            </p>
            <ul className="o1d-checklist">
              {[
                'Jobs filtered to match your O-1 score',
                'Companies verified and ready to sponsor',
                'Apply with one click',
                'Track all your applications',
              ].map((item) => (
                <li key={item}><span className="o1d-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── STEP 5: Interest Letters ─── */}
      <section className="o1d-section o1d-section-white">
        <div className="o1d-step-grid o1d-fade-up">
          {/* Text */}
          <div>
            <div className="o1d-step-badge">Step 5</div>
            <h2 className="o1d-step-heading">Receive Interest Letters</h2>
            <p className="o1d-step-desc">
              Employers who are interested in your profile can send you USCIS-compliant
              interest letters. These letters are crucial evidence for your O-1 petition.
            </p>
            <ul className="o1d-checklist">
              {[
                'USCIS-ready letter format',
                'Digital signatures from verified employers',
                'Download as PDF for your petition',
                'Your identity protected until you accept',
              ].map((item) => (
                <li key={item}><span className="o1d-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>

          {/* Mockup — Letter */}
          <div className="o1d-mock-wrap">
            <div className="o1d-mock-window">
              <div className="o1d-mock-chrome">
                <div className="o1d-mock-dot o1d-mock-dot-r" />
                <div className="o1d-mock-dot o1d-mock-dot-y" />
                <div className="o1d-mock-dot o1d-mock-dot-g" />
                <span className="o1d-mock-title">Interest Letters</span>
              </div>
              <div className="o1d-mock-body">
                {/* Notification */}
                <div style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.9rem', borderRadius: '10px', marginBottom: '1rem',
                  background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>✉️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0B1D35' }}>New Interest Letter!</p>
                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>2h ago</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                      TechCorp wants to sponsor your O-1 visa
                    </p>
                  </div>
                </div>
                {/* Letter preview */}
                <div style={{
                  border: '1px solid #E8E0D4', borderRadius: '10px', padding: '1.25rem',
                  background: '#FDFCFA',
                }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #E8E0D4', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0B1D35', letterSpacing: '0.05em' }}>INTEREST LETTER</p>
                    <p style={{ fontSize: '0.7rem', color: '#64748B' }}>For O-1 Visa Petition</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748B' }}>To Whom It May Concern,</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>TechCorp expresses genuine interest in employing the beneficiary as a Senior AI Engineer…</p>
                    <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>The candidate&apos;s extraordinary abilities in…</p>
                  </div>
                  <div style={{
                    marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E8E0D4',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0B1D35' }}>John Smith</p>
                      <p style={{ fontSize: '0.68rem', color: '#64748B' }}>CEO, TechCorp</p>
                    </div>
                    <span style={{
                      padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.75rem',
                      background: 'rgba(212,168,75,0.15)', color: '#B8862D', fontWeight: 600,
                    }}>Download PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRIVACY BAND ─── */}
      <section className="o1d-section o1d-section-navy o1d-section-sm">
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }} className="o1d-fade-up">
          <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>🔒</div>
          <h2 className="o1d-section-title-white" style={{ marginBottom: '0.75rem' }}>
            Your Privacy is Protected
          </h2>
          <p className="o1d-section-desc-white" style={{ marginBottom: '1.5rem' }}>
            Your personal information — name, contact details, photo — is hidden from employers
            until you explicitly accept their interest letter. Employers only see your
            anonymized candidate ID, qualifications, and O-1 score.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              <Eye size={16} />
              <span>Anonymized Profiles</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              <Shield size={16} />
              <span>You Control Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="o1d-section o1d-section-cream">
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }} className="o1d-fade-up">
          <span className="o1d-section-tag">Get Started Today</span>
          <h2 className="o1d-section-title">Ready to Start Your O-1 Journey?</h2>
          <p className="o1d-section-desc" style={{ marginBottom: '2rem' }}>
            Join thousands of extraordinary talents building their O-1 profiles and
            connecting with U.S. employers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup?role=talent" className="o1d-btn-primary">
              Create Free Account →
            </Link>
            <Link href="/how-it-works/employers" className="o1d-btn-outline">
              I&apos;m an Employer
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}