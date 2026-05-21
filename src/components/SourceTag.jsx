import { ExternalLink } from 'lucide-react';

export default function SourceTag({ label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-xs text-slate-500 hover:text-blue-400 transition-colors hover:underline underline-offset-2"
    >
      {label}
      <ExternalLink size={9} />
    </a>
  );
}
