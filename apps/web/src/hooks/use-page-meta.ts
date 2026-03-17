import { useEffect } from 'react';

type PageMetaOptions = {
  title: string;
  description: string;
};

const updateMetaTag = (selector: string, attribute: 'content' | 'href', value: string) => {
  const element = document.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);

  if (element) {
    element.setAttribute(attribute, value);
  }
};

export const usePageMeta = ({ title, description }: PageMetaOptions) => {
  useEffect(() => {
    document.title = title;
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
  }, [description, title]);
};
