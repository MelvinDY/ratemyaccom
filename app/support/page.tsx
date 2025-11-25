'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
} from 'lucide-react';

export default function SupportPage() {
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
    // Simulate API call
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
      question: 'Can accommodation providers respond to reviews?',
      answer:
        'Yes, verified accommodation providers can claim their listing and respond to reviews professionally. This helps create transparent dialogue between students and providers.',
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
    {
      question: "What if my accommodation isn't listed?",
      answer:
        'You can submit a new accommodation listing through the "Add Accommodation" feature. Provide basic details and our team will verify and publish it.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-teal-50/30 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold mb-8 shadow-sm"
            >
              <HelpCircle className="h-4 w-4" />
              We&apos;re Here to Help
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight"
            >
              Support & Legal
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium"
            >
              Find answers, get in touch, or learn about our policies
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <Tabs defaultValue="help" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent mb-12">
            <TabsTrigger
              value="help"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Help Center</span>
              <span className="sm:hidden">Help</span>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Us</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy Policy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="terms"
              className="flex items-center gap-2 px-6 py-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Terms of Service</span>
              <span className="sm:hidden">Terms</span>
            </TabsTrigger>
          </TabsList>

          {/* Help Center Tab */}
          <TabsContent value="help">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <Card className="p-8 md:p-10 border-0 shadow-xl rounded-3xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-blue-600" />
                    Frequently Asked Questions
                  </h2>

                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-gray-200 rounded-2xl px-6 overflow-hidden"
                      >
                        <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600 py-5 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 pb-5 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-gray-700 text-center">
                      Can&apos;t find what you&apos;re looking for?{' '}
                      <button
                        onClick={() => {
                          const tabs = document.querySelector('[value="contact"]');
                          if (tabs) {
                            (tabs as HTMLElement).click();
                          }
                        }}
                        className="text-blue-600 font-semibold hover:text-blue-700 underline"
                      >
                        Contact our support team
                      </button>
                    </p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Contact Us Tab */}
          <TabsContent value="contact">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid md:grid-cols-2 gap-8"
            >
              <motion.div variants={itemVariants}>
                <Card className="p-8 md:p-10 border-0 shadow-xl rounded-3xl h-full">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Mail className="h-8 w-8 text-blue-600" />
                    Get in Touch
                  </h2>
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    Have a question or feedback? Fill out the form and we&apos;ll get back to you
                    within 24 hours.
                  </p>

                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-green-800 font-medium">
                        Message sent successfully! We&apos;ll be in touch soon.
                      </p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-base font-semibold">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-base font-semibold">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <Card className="p-8 border-0 shadow-xl rounded-3xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Email</p>
                        <a
                          href="mailto:support@ratemyaccom.com.au"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          support@ratemyaccom.com.au
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Phone</p>
                        <p className="text-gray-700">1300 ACCOM (1300 226 666)</p>
                        <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-5pm AEST</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Office</p>
                        <p className="text-gray-700">
                          Sydney, NSW
                          <br />
                          Australia
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border-0 shadow-xl rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Response Time</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <p className="font-semibold text-gray-900">Within 24 hours</p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    We aim to respond to all inquiries within one business day. For urgent matters,
                    please call our support line.
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Privacy Policy Tab */}
          <TabsContent value="privacy">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Card className="p-8 md:p-12 border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Shield className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Privacy Policy</h2>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 italic mb-8">Last updated: November 25, 2025</p>

                    <div className="space-y-8">
                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Eye className="h-6 w-6 text-blue-600" />
                          Information We Collect
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            <strong>Account Information:</strong> When you register, we collect your
                            name, email address (.edu.au required for student verification), and
                            password (securely hashed).
                          </p>
                          <p>
                            <strong>Profile Data:</strong> Optional information such as university
                            affiliation, profile picture, and bio.
                          </p>
                          <p>
                            <strong>Reviews and Content:</strong> Text reviews, ratings, photos, and
                            any other content you submit to the platform.
                          </p>
                          <p>
                            <strong>Usage Data:</strong> Information about how you interact with our
                            platform, including IP address, browser type, pages visited, and time
                            spent.
                          </p>
                          <p>
                            <strong>Communication Data:</strong> Records of support inquiries,
                            feedback, and correspondence with our team.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Lock className="h-6 w-6 text-blue-600" />
                          How We Use Your Information
                        </h3>
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Verify student status through .edu.au email addresses</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Provide and improve our accommodation review services</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Send important platform updates and notifications</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Detect and prevent fraud, abuse, and security issues</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Analyze usage patterns to enhance user experience</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <span>Respond to support requests and inquiries</span>
                          </li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <UserCheck className="h-6 w-6 text-blue-600" />
                          Data Security
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We implement industry-standard security measures to protect your
                            personal information:
                          </p>
                          <ul className="space-y-2 ml-6 list-disc">
                            <li>Password encryption using bcrypt with salt rounds</li>
                            <li>HTTPS/TLS encryption for all data transmission</li>
                            <li>Secure session management with JWT tokens</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>CSRF protection on all authentication endpoints</li>
                            <li>Rate limiting to prevent brute force attacks</li>
                            <li>Account lockout mechanisms after failed login attempts</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Information Sharing
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            <strong>
                              We do not sell your personal information to third parties.
                            </strong>
                          </p>
                          <p>We may share information in the following circumstances:</p>
                          <ul className="space-y-2 ml-6 list-disc">
                            <li>
                              <strong>Public Reviews:</strong> Reviews you post are publicly visible
                              along with your username and profile picture
                            </li>
                            <li>
                              <strong>Service Providers:</strong> Trusted vendors who help operate
                              our platform (hosting, email, analytics) under strict confidentiality
                            </li>
                            <li>
                              <strong>Legal Compliance:</strong> When required by law or to protect
                              our rights and user safety
                            </li>
                            <li>
                              <strong>Business Transfers:</strong> In the event of a merger or
                              acquisition, with user notification
                            </li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>Under Australian Privacy Law, you have the right to:</p>
                          <ul className="space-y-2 ml-6 list-disc">
                            <li>Access your personal information</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and data</li>
                            <li>Export your data in a portable format</li>
                            <li>Opt-out of marketing communications</li>
                            <li>
                              Lodge a complaint with the Office of the Australian Information
                              Commissioner (OAIC)
                            </li>
                          </ul>
                          <p className="mt-4">
                            To exercise these rights, contact us at{' '}
                            <a
                              href="mailto:privacy@ratemyaccom.com.au"
                              className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              privacy@ratemyaccom.com.au
                            </a>
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We use cookies and similar technologies to maintain your session,
                            remember your preferences, and analyze site usage. You can control
                            cookies through your browser settings, but disabling them may limit some
                            functionality.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We retain your personal information for as long as your account is
                            active or as needed to provide services. If you delete your account, we
                            will remove your personal data within 30 days, except where required by
                            law or for legitimate business purposes (e.g., fraud prevention).
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Changes to This Policy
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We may update this privacy policy from time to time. We will notify you
                            of significant changes via email or prominent platform notice. Your
                            continued use of RateMyAccom after changes indicates acceptance.
                          </p>
                        </div>
                      </section>

                      <section className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Questions?</h3>
                        <p className="text-gray-700">
                          If you have questions about this privacy policy or our data practices,
                          please contact us at{' '}
                          <a
                            href="mailto:privacy@ratemyaccom.com.au"
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            privacy@ratemyaccom.com.au
                          </a>
                        </p>
                      </section>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Terms of Service Tab */}
          <TabsContent value="terms">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Card className="p-8 md:p-12 border-0 shadow-xl rounded-3xl">
                  <div className="flex items-center gap-3 mb-8">
                    <FileText className="h-10 w-10 text-blue-600" />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                      Terms of Service
                    </h2>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 italic mb-8">Last updated: November 25, 2025</p>

                    <div className="space-y-8">
                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          1. Acceptance of Terms
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            By accessing or using RateMyAccom (&quot;the Platform&quot;), you agree
                            to be bound by these Terms of Service (&quot;Terms&quot;). If you do not
                            agree to these Terms, please do not use our Platform.
                          </p>
                          <p>
                            RateMyAccom is a platform designed for Australian university students to
                            share and access accommodation reviews. By using our services, you
                            represent that you are at least 18 years old and have the legal capacity
                            to enter into these Terms.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          2. Account Registration
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            <strong>Student Verification:</strong> To create an account and post
                            reviews, you must register with a valid .edu.au email address. This
                            ensures that all reviews come from verified Australian university
                            students.
                          </p>
                          <p>
                            <strong>Account Security:</strong> You are responsible for maintaining
                            the confidentiality of your account credentials. Any activity under your
                            account is your responsibility. Notify us immediately of any
                            unauthorized access.
                          </p>
                          <p>
                            <strong>Accurate Information:</strong> You agree to provide accurate,
                            current, and complete information during registration and to update it
                            as necessary.
                          </p>
                          <p>
                            <strong>One Account Per Person:</strong> Each user may maintain only one
                            account. Creating multiple accounts is prohibited.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          3. User Content and Reviews
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            <strong>Honest Reviews:</strong> Reviews must be based on your genuine
                            personal experience with the accommodation. You must have stayed at or
                            have direct knowledge of the accommodation you review.
                          </p>
                          <p>
                            <strong>Prohibited Content:</strong> You may not post content that:
                          </p>
                          <ul className="space-y-2 ml-6 list-disc">
                            <li>Contains false, misleading, or defamatory information</li>
                            <li>Violates intellectual property rights</li>
                            <li>Includes hate speech, harassment, or discrimination</li>
                            <li>Contains profanity or inappropriate language</li>
                            <li>Promotes illegal activities</li>
                            <li>Contains personal information of others without consent</li>
                            <li>Is spam or promotional in nature</li>
                            <li>Has been incentivized or paid for by accommodation providers</li>
                          </ul>
                          <p>
                            <strong>Content Ownership:</strong> You retain ownership of your
                            content, but grant RateMyAccom a non-exclusive, worldwide, royalty-free
                            license to use, display, and distribute your reviews on the Platform.
                          </p>
                          <p>
                            <strong>Moderation:</strong> We reserve the right to remove any content
                            that violates these Terms or our Community Guidelines without notice.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            You agree to use the Platform only for lawful purposes. You must not:
                          </p>
                          <ul className="space-y-2 ml-6 list-disc">
                            <li>Attempt to gain unauthorized access to any part of the Platform</li>
                            <li>Interfere with or disrupt the Platform or servers</li>
                            <li>Use automated tools (bots, scrapers) without permission</li>
                            <li>Manipulate ratings or reviews through fake accounts</li>
                            <li>Harass, threaten, or intimidate other users</li>
                            <li>Impersonate any person or entity</li>
                            <li>Collect user information without consent</li>
                          </ul>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          5. Intellectual Property
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            The Platform, including its design, code, logos, and content (excluding
                            user-generated content), is owned by RateMyAccom and protected by
                            intellectual property laws. You may not copy, modify, distribute, or
                            create derivative works without our written permission.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          6. Disclaimers and Limitations
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            <strong>Platform As-Is:</strong> The Platform is provided &quot;as
                            is&quot; without warranties of any kind, express or implied. We do not
                            guarantee uninterrupted or error-free service.
                          </p>
                          <p>
                            <strong>Review Accuracy:</strong> Reviews represent individual user
                            opinions. We do not verify the accuracy of reviews or endorse any
                            accommodation. Users should conduct their own research before making
                            decisions.
                          </p>
                          <p>
                            <strong>Limitation of Liability:</strong> To the fullest extent
                            permitted by law, RateMyAccom shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages arising from
                            your use of the Platform.
                          </p>
                          <p>
                            <strong>Third-Party Links:</strong> The Platform may contain links to
                            third-party websites. We are not responsible for the content or
                            practices of these external sites.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          7. Account Termination
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We reserve the right to suspend or terminate your account at any time
                            for violations of these Terms, fraudulent activity, or any conduct we
                            deem harmful to the Platform or other users.
                          </p>
                          <p>
                            You may delete your account at any time through your account settings.
                            Upon deletion, your personal information will be removed in accordance
                            with our Privacy Policy.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          8. Dispute Resolution
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            These Terms are governed by the laws of New South Wales, Australia. Any
                            disputes arising from these Terms or your use of the Platform shall be
                            resolved through binding arbitration in Sydney, NSW, except where
                            prohibited by law.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          9. Changes to Terms
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            We may modify these Terms at any time. We will notify users of material
                            changes via email or prominent Platform notice. Your continued use of
                            the Platform after changes constitutes acceptance of the modified Terms.
                          </p>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          10. Contact Information
                        </h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                          <p>
                            For questions about these Terms, please contact us at:
                            <br />
                            <a
                              href="mailto:legal@ratemyaccom.com.au"
                              className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              legal@ratemyaccom.com.au
                            </a>
                          </p>
                        </div>
                      </section>

                      <section className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Important Notice
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                              By using RateMyAccom, you acknowledge that you have read, understood,
                              and agree to be bound by these Terms of Service and our Privacy
                              Policy. If you do not agree, please discontinue use of the Platform
                              immediately.
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
