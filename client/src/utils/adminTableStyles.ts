export const tableCustomStyles = {
  headRow: {
    style: {
      backgroundColor: '#F8F9FA',
      borderBottom: '2px solid #E2E8F0',
      fontWeight: '700',
      fontSize: '0.8rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: '#4F5D75',
    },
  },
  rows: {
    style: {
      fontSize: '0.875rem',
      color: '#253D4E',
      transition: 'background-color 0.15s ease',
      '&:hover': { backgroundColor: '#F4FBF8' },
    },
  },
  pagination: {
    style: {
      borderTop: '1px solid #E2E8F0',
      padding: '12px 0',
    },
  },
};
