import { Github, Linkedin, Youtube } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@SciAmrSherif',
    Icon: Youtube,
    className: 'hover:border-red-300 hover:text-red-700 dark:hover:border-red-800 dark:hover:text-red-400'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/AmrSherifCodes',
    Icon: Github,
    className: 'hover:border-slate-400 hover:text-slate-900 dark:hover:border-slate-500 dark:hover:text-white'
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sciamrsherif-abdelaal/',
    Icon: Linkedin,
    className: 'hover:border-sky-300 hover:text-sky-700 dark:hover:border-sky-800 dark:hover:text-sky-300'
  }
] as const;

export function SocialLinks() {
  return (
    <section
      aria-labelledby="social-links-heading"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h3
        id="social-links-heading"
        className="text-sm font-semibold text-slate-900 dark:text-slate-100"
      >
        Connect with the Creator
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {SOCIAL_LINKS.map(({ label, href, Icon, className }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit the creator on ${label} (opens in a new tab)`}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500 dark:border-slate-600 dark:text-slate-300 ${className}`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
