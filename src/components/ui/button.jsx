export const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 h-10 py-2 px-4 shadow ${className}`}
    {...props}
  >
    {children}
  </button>
);
