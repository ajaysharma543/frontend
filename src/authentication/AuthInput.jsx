import { forwardRef, useState } from 'react';

const AuthInput = forwardRef(
  ({ label, type = 'text', error, icon, rightElement, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="w-full">
        <label className="block text-md font-semibold text-gray-900 mb-1.5 tracking-wide">
          {label}
        </label>

        <div
          className={`relative rounded-2xl bg-white/95 shadow-sm transition-all duration-200
            ${error
              ? 'ring-2 ring-red-400'
              : focused
              ? 'ring-2 ring-orange-400 shadow-md shadow-orange-500/20'
              : 'ring-1 ring-black/5'}
          `}
        >
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            type={type}
            onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
            className={`w-full h-[46px] bg-transparent outline-none border-none rounded-2xl
              text-gray-800 text-[0.95rem] ${icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'}`}
            {...rest}
          />

          {rightElement && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p className="text-red-300 text-xs mt-1.5 flex items-center gap-1">
            <i className="fa-solid fa-circle-exclamation text-[0.65rem]"></i>
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default AuthInput;