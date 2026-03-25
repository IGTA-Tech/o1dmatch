/* src/components/Footer.tsx */
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="o1d-footer">
      <div className="o1d-footer-inner">
        <div className="o1d-footer-grid">
          <div>
            <span className="o1d-footer-logo">O1DMatch</span>
            <p className="o1d-footer-tagline">
              Connecting exceptional talent with opportunities for O-1 visa sponsorship.
            </p>
          </div>
          <div className="o1d-footer-col">
            <h4>Platform</h4>
            <Link href="/how-it-works/candidates">For Candidates</Link>
            <Link href="/how-it-works/employers">For Employers</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/enterprise">Enterprise</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="o1d-footer-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/careers">Careers</Link>
          </div>
          <div className="o1d-footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="o1d-footer-bottom">
          <span>© {new Date().getFullYear()} O1DMatch. All rights reserved.</span>
          <span>Built by a licensed immigration attorney.</span>
        </div>
      </div>
    </footer>
  );
}