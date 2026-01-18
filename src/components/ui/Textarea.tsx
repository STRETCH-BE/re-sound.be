"use client";

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = true, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`textarea-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="textarea-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea ${error ? 'textarea-error' : ''}`}
          {...props}
        />
        {error && <span className="error-text">{error}</span>}
        {helperText && !error && <span className="helper-text">{helperText}</span>}

        <style jsx>{`
          .textarea-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .full-width {
            width: 100%;
          }

          .textarea-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--deep-blue);
          }

          .required {
            color: #e53e3e;
            margin-left: 0.25rem;
          }

          .textarea {
            padding: 0.9rem 1.25rem;
            border: 2px solid var(--sand);
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            color: var(--charcoal);
            background: white;
            transition: all 0.3s ease;
            outline: none;
            resize: vertical;
            min-height: 120px;
          }

          .textarea:focus {
            border-color: var(--brand-blue);
            box-shadow: 0 0 0 3px var(--brand-blue-pale);
          }

          .textarea::placeholder {
            color: #aaa;
          }

          .textarea-error {
            border-color: #e53e3e;
          }

          .textarea-error:focus {
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2);
          }

          .error-text {
            font-size: 0.85rem;
            color: #e53e3e;
          }

          .helper-text {
            font-size: 0.85rem;
            color: #888;
          }
        `}</style>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
