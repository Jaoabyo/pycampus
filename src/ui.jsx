import * as Icons from './icons.js';

export const Icon = ({ name, size = 20, ...props }) => { const Component = Icons[name] || Icons.Code2; return <Component size={size} strokeWidth={1.8} {...props} />; };
export function Progress({ value, className = '' }) {
  return <div className={`progress ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}
