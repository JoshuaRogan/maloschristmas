import { useEffect } from 'react';

/**
 * Sets the document title with a consistent site suffix.
 * If titlePart is falsy, just uses the suffix.
 */
export default function usePageTitle(titlePart, options = {}) {
  const { suffix = 'Malos Christmas' } = options;
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = titlePart ? `${suffix} - ${titlePart}` : suffix;
  }, [titlePart, suffix]);
}
