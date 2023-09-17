import { useTheme } from 'nextra-theme-docs';

export function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}
