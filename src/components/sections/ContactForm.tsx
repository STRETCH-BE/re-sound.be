'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const subjectOptions = [
    { value: 'quote', label: t('subjects.quote') },
    { value: 'info', label: t('subjects.info') },
    { value: 'partnership', label: t('subjects.partnership') },
    { value: 'other', label: t('subjects.other') },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-row">
        <Input
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
          required
        />
        <Input
          name="email"
          type="email"
          label={t('email')}
          placeholder={t('emailPlaceholder')}
          required
        />
      </div>

      <div className="form-row">
        <Input
          name="company"
          label={t('company')}
          placeholder={t('companyPlaceholder')}
        />
        <Input
          name="phone"
          type="tel"
          label={t('phone')}
          placeholder={t('phonePlaceholder')}
        />
      </div>

      <Select
        name="subject"
        label={t('subject')}
        options={subjectOptions}
        placeholder={t('subjectPlaceholder')}
        required
      />

      <Textarea
        name="message"
        label={t('message')}
        placeholder={t('messagePlaceholder')}
        rows={5}
        required
      />

      {submitStatus === 'success' && (
        <div className="form-message success">
          <span>✓</span> {t('successMessage')}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="form-message error">
          <span>!</span> {t('errorMessage')}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? t('sending') : t('submit')}
        {!isSubmitting && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        )}
      </button>

      <style jsx>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        .form-message.success {
          background: #e6f7f0;
          color: #059669;
        }

        .form-message.error {
          background: #fef2f2;
          color: #dc2626;
        }

        .form-message span {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .form-message.success span {
          background: #059669;
          color: white;
        }

        .form-message.error span {
          background: #dc2626;
          color: white;
        }

        .contact-form .btn-primary {
          align-self: flex-start;
        }

        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .contact-form .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </form>
  );
}
