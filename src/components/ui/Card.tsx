// niente ombre: la separazione è il bordo
export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-card border border-line bg-surface ${className ?? ""}`}>{children}</div>
);
