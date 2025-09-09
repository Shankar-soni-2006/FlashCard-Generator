const Logo = ({ size = 40 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#4F46E5"/>
      <rect x="12" y="14" width="16" height="12" rx="2" fill="#FFFFFF"/>
      <line x1="15" y1="18" x2="25" y2="18" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="20" x2="23" y2="20" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="22" x2="21" y2="22" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M28 12l4 4-4 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default Logo;