import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const payload = await response.json().catch(() => ({}));
        const msg = payload?.message || 'Failed to send message';
        toast.error(msg);
      }
      // small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen auth-container">
      {/* Left Side - Get in Touch */}
      <div className="hidden w-1/2 p-12 lg:flex items-center justify-center">
        <div className="max-w-xl">
          <h1 className="text-7xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            Have questions or need help with our AI Content Detection service? 
            Our support team is ready to assist you and ensure you get the most out of our platform.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span className="text-white/70">Quick Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Contact Form */}
      <div className="w-full lg:w-1/2 bg-black/30 p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Contact Form Card */}
          <div className="w-full p-6 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Contact Us</h2>
              <p className="text-base text-white/80">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full bg-white/5 border-white/10 text-white"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full bg-white/5 border-white/10 text-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white/90 mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="w-full bg-white/5 border-white/10 text-white"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                  className="w-full bg-white/5 border-white/10 text-white"
                  rows={4}
                  placeholder="Your message here..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2"
                isLoading={isSubmitting}
              >
                Send Message
              </Button>
            </form>

            {isSuccess && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-500 text-center">
                  Thank you! Your message has been sent successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}