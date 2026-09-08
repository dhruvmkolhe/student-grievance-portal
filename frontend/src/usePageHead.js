import { useEffect } from "react";

/**
 * Dynamically updates document.title and meta description per route.
 * Zero-dependency helper for standard single-page app SEO.
 * 
 * @param {string} title - The specific title for the page
 * @param {string} [description] - Optional specific meta description
 */
export function usePageHead(title, description) {
  useEffect(() => {
    const defaultTitle = "Redressal — Student Grievance Portal";
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} — Redressal`;
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute("content") : "";
    if (description && metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    return () => {
      document.title = prevTitle || defaultTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute("content", prevDesc);
      }
    };
  }, [title, description]);
}

export default usePageHead;
