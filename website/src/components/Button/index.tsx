export function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}
