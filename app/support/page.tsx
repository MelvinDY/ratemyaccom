'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Shield,
  FileText,
  Lock,
  Eye,
  UserCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  BookOpen,
  Scale,
  Loader2,
  ChevronDown,
} from 'lucide-react';

function SupportPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'help');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (tabParam && ['help', 'contact', 'privacy', 'terms'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const faqs = [
    {
      question: 'How do I create an account?',
      answer:
        'Click "Sign Up" in the top right corner and register with your .edu.au email address. You\'ll receive a verification email to complete your registration.',
    },
    {
      question: 'Can I leave a review without a verified account?',
      answer:
        'No, all reviews must come from verified .edu.au email addresses to maintain the integrity and trustworthiness of our platform.',
    },
    {
      question: 'How do I search for accommodations?',
      answer:
        'Use the search bar on the homepage to search by accommodation name, suburb, or university. You can also filter by rating, price range, and amenities.',
    },
    {
      question: 'Can I edit or delete my review?',
      answer:
        'Yes, you can edit or delete your reviews at any time from your profile page. Navigate to "My Reviews" to manage your submissions.',
    },
    {
      question: 'What should I do if I see an inappropriate review?',
      answer:
        'Use the "Report" button on any review that violates our community guidelines. Our moderation team will investigate and take appropriate action.',
    },
    {
      question: 'Is my personal information safe?',
      answer:
        'Yes, we take data security seriously. We use industry-standard encryption, never share your personal information with third parties, and comply with Australian privacy laws.',
    },
    {
      question: 'How are ratings calculated?',
      answer:
        'Overall ratings are calculated from multiple criteria including location, facilities, value for money, cleanliness, and management responsiveness. Each criterion is weighted equally.',
    },
    {
      question: 'Can I save accommodations to view later?',
      answer:
        'Yes, use the bookmark icon on any accommodation listing to save it to your favorites. Access your saved listings from your profile.',
    },
  ];

  const tabs = [
    { id: 'help', label: 'Help Center', icon: BookOpen },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 to-transparent" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px] -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-purple-600" />
              <span className="text-sm text-purple-600 font-medium tracking-wide">
                Support & Legal
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 leading-[1.1] tracking-tight mb-6">
              How can we <span className="text-purple-600">help</span>?
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Find answers, get in touch, or learn about our policies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-20 z-40 bg-[#FAFAFA]/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex gap-1 overflow-x-auto py-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Help Center */}
          {activeTab === 'help' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            expandedFaq === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed pt-4">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-2xl bg-purple-50 border border-purple-100">
                  <p className="text-gray-700 text-center">
                    Can&apos;t find what you&apos;re looking for?{' '}
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="text-purple-600 font-medium hover:text-purple-700 underline"
                    >
                      Contact our support team
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact Us */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <Mail className="w-6 h-6 text-purple-600" />
                      <h2 className="text-2xl font-semibold text-gray-900">Get in Touch</h2>
                    </div>
                    <p className="text-gray-600 mb-8">
                      Have a question or feedback? Fill out the form and we&apos;ll get back to you
                      within 24 hours.
                    </p>

                    {submitSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                          Message sent successfully! We&apos;ll be in touch soon.
                        </p>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          placeholder="What's this about?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={5}
                          className="rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">
                      Contact Information
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Email</p>
                          <a
                            href="mailto:support@ratemyaccom.com.au"
                            className="text-purple-600 hover:text-purple-700 text-sm"
                          >
                            support@ratemyaccom.com.au
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Phone</p>
                          <p className="text-gray-600 text-sm">1300 ACCOM (1300 226 666)</p>
                          <p className="text-gray-500 text-xs mt-1">Mon-Fri, 9am-5pm AEST</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Office</p>
                          <p className="text-gray-600 text-sm">Sydney, NSW, Australia</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      We aim to respond to all inquiries within 24 hours. For urgent matters, please
                      call our support line.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <h2 className="text-3xl font-semibold text-gray-900">Privacy Policy</h2>
                  </div>
                  <p className="text-gray-500 mb-10">Last updated: November 25, 2025</p>

                  <div className="space-y-10">
                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          Information We Collect
                        </h3>
                      </div>
                      <div className="space-y-4 text-gray-600 leading-relaxed pl-8">
                        <p>
                          <strong className="text-gray-900">Account Information:</strong> When you
                          register, we collect your name, email address (.edu.au required), and
                          password (securely hashed).
                        </p>
                        <p>
                          <strong className="text-gray-900">Profile Data:</strong> Optional
                          information such as university affiliation, profile picture, and bio.
                        </p>
                        <p>
                          <strong className="text-gray-900">Reviews and Content:</strong> Text
                          reviews, ratings, photos, and any content you submit.
                        </p>
                        <p>
                          <strong className="text-gray-900">Usage Data:</strong> Information about
                          how you interact with our platform, including IP address, browser type,
                          and pages visited.
                        </p>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          How We Use Your Information
                        </h3>
                      </div>
                      <ul className="space-y-3 pl-8">
                        {[
                          'Verify student status through .edu.au email addresses',
                          'Provide and improve our accommodation review services',
                          'Send important platform updates and notifications',
                          'Detect and prevent fraud, abuse, and security issues',
                          'Analyze usage patterns to enhance user experience',
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <div className="flex items-center gap-3 mb-4">
                        <UserCheck className="w-5 h-5 text-purple-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Data Security</h3>
                      </div>
                      <div className="pl-8 text-gray-600 leading-relaxed">
                        <p className="mb-4">
                          We implement industry-standard security measures to protect your personal
                          information:
                        </p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Password encryption using bcrypt with salt rounds</li>
                          <li>HTTPS/TLS encryption for all data transmission</li>
                          <li>Secure session management with JWT tokens</li>
                          <li>CSRF protection on all authentication endpoints</li>
                          <li>Rate limiting to prevent brute force attacks</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 pl-8">
                        Information Sharing
                      </h3>
                      <div className="pl-8 text-gray-600 leading-relaxed">
                        <p className="font-medium text-gray-900 mb-3">
                          We do not sell your personal information to third parties.
                        </p>
                        <p className="mb-3">We may share information in these circumstances:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>
                            <strong>Public Reviews:</strong> Reviews you post are publicly visible
                          </li>
                          <li>
                            <strong>Service Providers:</strong> Trusted vendors under strict
                            confidentiality
                          </li>
                          <li>
                            <strong>Legal Compliance:</strong> When required by law
                          </li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 pl-8">Your Rights</h3>
                      <div className="pl-8 text-gray-600 leading-relaxed">
                        <p className="mb-3">Under Australian Privacy Law, you have the right to:</p>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Access your personal information</li>
                          <li>Request correction of inaccurate data</li>
                          <li>Request deletion of your account and data</li>
                          <li>Export your data in a portable format</li>
                          <li>Opt-out of marketing communications</li>
                        </ul>
                        <p className="mt-4">
                          To exercise these rights, contact us at{' '}
                          <a
                            href="mailto:privacy@ratemyaccom.com.au"
                            className="text-purple-600 hover:text-purple-700 font-medium"
                          >
                            privacy@ratemyaccom.com.au
                          </a>
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Terms of Service */}
          {activeTab === 'terms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <h2 className="text-3xl font-semibold text-gray-900">Terms of Service</h2>
                  </div>
                  <p className="text-gray-500 mb-10">Last updated: November 25, 2025</p>

                  <div className="space-y-10">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        1. Acceptance of Terms
                      </h3>
                      <div className="text-gray-600 leading-relaxed space-y-3">
                        <p>
                          By accessing or using RateMyAccom (&quot;the Platform&quot;), you agree to
                          be bound by these Terms of Service. If you do not agree, please do not use
                          our Platform.
                        </p>
                        <p>
                          RateMyAccom is designed for Australian university students to share and
                          access accommodation reviews. By using our services, you represent that
                          you are at least 18 years old.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        2. Account Registration
                      </h3>
                      <div className="text-gray-600 leading-relaxed space-y-3">
                        <p>
                          <strong className="text-gray-900">Student Verification:</strong> To create
                          an account and post reviews, you must register with a valid .edu.au email
                          address.
                        </p>
                        <p>
                          <strong className="text-gray-900">Account Security:</strong> You are
                          responsible for maintaining the confidentiality of your account
                          credentials.
                        </p>
                        <p>
                          <strong className="text-gray-900">One Account Per Person:</strong> Each
                          user may maintain only one account.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        3. User Content and Reviews
                      </h3>
                      <div className="text-gray-600 leading-relaxed space-y-3">
                        <p>
                          <strong className="text-gray-900">Honest Reviews:</strong> Reviews must be
                          based on your genuine personal experience with the accommodation.
                        </p>
                        <p>
                          <strong className="text-gray-900">Prohibited Content:</strong> You may not
                          post content that:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Contains false, misleading, or defamatory information</li>
                          <li>Includes hate speech, harassment, or discrimination</li>
                          <li>Contains profanity or inappropriate language</li>
                          <li>Promotes illegal activities</li>
                          <li>Is spam or promotional in nature</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        4. Acceptable Use
                      </h3>
                      <div className="text-gray-600 leading-relaxed">
                        <p className="mb-3">
                          You agree to use the Platform only for lawful purposes. You must not:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Attempt to gain unauthorized access to any part of the Platform</li>
                          <li>Use automated tools (bots, scrapers) without permission</li>
                          <li>Manipulate ratings or reviews through fake accounts</li>
                          <li>Harass, threaten, or intimidate other users</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        5. Disclaimers and Limitations
                      </h3>
                      <div className="text-gray-600 leading-relaxed space-y-3">
                        <p>
                          <strong className="text-gray-900">Platform As-Is:</strong> The Platform is
                          provided &quot;as is&quot; without warranties of any kind.
                        </p>
                        <p>
                          <strong className="text-gray-900">Review Accuracy:</strong> Reviews
                          represent individual user opinions. We do not verify the accuracy of
                          reviews.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        6. Account Termination
                      </h3>
                      <div className="text-gray-600 leading-relaxed">
                        <p>
                          We reserve the right to suspend or terminate your account at any time for
                          violations of these Terms. You may delete your account at any time through
                          your account settings.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        7. Changes to Terms
                      </h3>
                      <div className="text-gray-600 leading-relaxed">
                        <p>
                          We may modify these Terms at any time. We will notify users of material
                          changes via email or prominent Platform notice.
                        </p>
                      </div>
                    </section>

                    <div className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Important Notice
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            By using RateMyAccom, you acknowledge that you have read, understood,
                            and agree to be bound by these Terms of Service and our Privacy Policy.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center pt-6">
                      <p className="text-gray-600 mb-2">Questions about these terms?</p>
                      <a
                        href="mailto:legal@ratemyaccom.com.au"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        legal@ratemyaccom.com.au
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

function SupportPageLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<SupportPageLoading />}>
      <SupportPageContent />
    </Suspense>
  );
}
