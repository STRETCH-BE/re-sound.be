"use client";

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''}`}
          {...props}
        />
        {error && <span className="error-text">{error}</span>}
        {helperText && !error && <span className="helper-text">{helperText}</span>}

        <style jsx>{`
          .input-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .full-width {
            width: 100%;
          }

          .input-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--deep-blue);
          }

          .required {
            color: #e53e3e;
            margin-left: 0.25rem;
          }

          .input {
            padding: 0.9rem 1.25rem;
            border: 2px solid var(--sand);
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            color: var(--charcoal);
            background: white;
            transition: all 0.3s ease;
            outline: none;
          }

          .input:focus {
            border-color: var(--brand-blue);
            box-shadow: 0 0 0 3px var(--brand-blue-pale);
          }

          .input::placeholder {
            color: #aaa;
          }

          .input-error {
            border-color: #e53e3e;
          }

          .input-error:focus {
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

Input.displayName = 'Input';

export default Input;
