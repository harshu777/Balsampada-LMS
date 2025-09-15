import Link from 'next/link';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Clock,
  ArrowRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Courses', href: '/courses' },
    { name: 'Teachers', href: '/teachers' },
    { name: 'Student Portal', href: '/login' },
    { name: 'Teacher Portal', href: '/login' },
  ];

  const courses = [
    { name: 'Mathematics', href: '/courses/mathematics' },
    { name: 'Science', href: '/courses/science' },
    { name: 'English', href: '/courses/english' },
    { name: 'Computer Science', href: '/courses/computer-science' },
    { name: 'Social Studies', href: '/courses/social-studies' },
  ];

  const policies = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Code of Conduct', href: '/conduct' },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Subscribe to Our Newsletter</h3>
              <p className="text-white/90 text-sm">Get updates on new courses and exclusive offers</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-2 bg-white text-primary rounded-r-lg hover:bg-neutral-100 transition-colors font-medium flex items-center gap-2">
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="block mb-4">
              <img 
                src="/logo-white.png" 
                alt="Tuition LMS Logo" 
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-neutral-400 mb-4 text-sm">
              Empowering students and teachers with innovative online and offline learning solutions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">123 Education Street, Learning City</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">info@tuitionlms.com</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">Mon - Sat: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-primary transition-colors text-sm flex items-center gap-1"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Courses</h4>
            <ul className="space-y-2">
              {courses.map((course) => (
                <li key={course.name}>
                  <Link
                    href={course.href}
                    className="text-neutral-400 hover:text-primary transition-colors text-sm flex items-center gap-1"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 mb-6">
              {policies.map((policy) => (
                <li key={policy.name}>
                  <Link
                    href={policy.href}
                    className="text-neutral-400 hover:text-primary transition-colors text-sm flex items-center gap-1"
                  >
                    <ArrowRight className="h-3 w-3" />
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-800 p-2 rounded-lg hover:bg-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-800 p-2 rounded-lg hover:bg-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-800 p-2 rounded-lg hover:bg-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-800 p-2 rounded-lg hover:bg-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-neutral-400 text-sm text-center md:text-left">
              © {currentYear} All rights reserved.
            </p>
            <p className="text-neutral-400 text-sm text-center md:text-right">
              Made with ❤️ for Education
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;