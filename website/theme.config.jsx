import { Footer } from '@/src/components/Footer';

export default {
  logo: <span style={{ fontWeight: 600 }}>Sonner</span>,
  project: {
    link: 'https://github.com/emilkowalski/sonner',
  },
  docsRepositoryBase: 'https://github.com/emilkowalski/sonner/tree/main/website',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Sonner',
    };
  },
  feedback: {
    content: null,
  },
  footer: {
    // Use text here instead of component, component overrides the entire
    // theme-switcher and requires us to re-implement
    text: Footer,
  },
  // ... other theme options
};
