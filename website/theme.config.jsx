export default {
  logo: <span style={{ fontWeight: 600 }}>Sonner</span>,
  project: {
    link: 'https://github.com/emilkowalski/sonner',
  },
  docsRepositoryBase: 'https://github.com/emilkowalski/sonner',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Sonner',
    };
  },
  feedback: {
    content: null,
  },
  darkMode: false,
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://sonner.emilkowal.ski" target="_blank">
          Sonner
        </a>
        .
      </span>
    ),
  },
  // ... other theme options
};
