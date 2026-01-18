"use client";

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth = true, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`select-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {props.required && <span className="required">*</span>}
          </label>
        )}
        <div className="select-container">
          <select
            ref={ref}
            id={selectId}
            className={`select ${error ? 'select-error' : ''}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="select-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        {error && <span className="error-text">{error}</span>}
        {helperText && !error && <span className="helper-text">{helperText}</span>}

        <style jsx>{`
          .select-wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .full-width {
            width: 100%;
          }

          .select-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--deep-blue);
          }

          .required {
            color: #e53e3e;
            margin-left: 0.25rem;
          }

          .select-container {
            position: relative;
          }

          .select {
            width: 100%;
            padding: 0.9rem 2.5rem 0.9rem 1.25rem;
            border: 2px solid var(--sand);
            border-radius: 12px;
            font-size: 1rem;
            font-family: inherit;
            color: var(--charcoal);
            background: white;
            transition: all 0.3s ease;
            outline: none;
            cursor: pointer;
            appearance: none;
          }

          .select:focus {
            border-color: var(--brand-blue);
            box-shadow: 0 0 0 3px var(--brand-blue-pale);
          }

          .select-error {
            border-color: #e53e3e;
          }

          .select-error:focus {
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2);
          }

          .select-arrow {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #888;
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

Select.displayName = 'Select';

export default Select;
