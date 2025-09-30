import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
  ShieldCheck,
} from 'lucide-react';
import Logo from '@/components/logo';

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com',
  },
  {
    name: 'Email',
    icon: Mail,
    url: 'mailto:info@survivallife.com',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com',
  },
];

const quickLinks = [
  { name: 'Emergency Preparedness', url: '/checklist' },
  { name: 'Mental Health Resources', url: '/resources' },
  { name: 'Cyber Security', url: '/services/cyber-security' },
  { name: 'Disaster Management', url: '/services/disaster-management' },
  { name: 'Community Forums', url: '/community' },
];

const services = [
  { name: 'Accident Management', url: '/services/accident-management' },
  { name: 'Suicide Prevention', url: '/services/suicide-prevention' },
  { name: 'Cyber Security', url: '/services/cyber-security' },
  { name: 'Disaster Management', url: '/services/disaster-management' },
  { name: 'Resource Hub', url: '/resources' },
];

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Logo />
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Empowering individuals and communities with the knowledge, skills,
              and resources needed to navigate life's challenges and build
              resilience for a safer tomorrow.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-headline font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-headline font-semibold text-foreground mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-headline font-semibold text-foreground mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0" />
                <span>123 Safety Street, Preparedness City, PC 12345</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-4 w-4 mr-3 mt-1 shrink-0" />
                <div>
                  <p>Emergency: 911</p>
                  <p>Hotline: 1-800-SURVIVE</p>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="h-4 w-4 mr-3 mt-1 shrink-0" />
                <a
                  href="mailto:info@survivallife.com"
                  className="hover:text-primary hover:underline"
                >
                  info@survivallife.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-background">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Survival Life. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
