import { Github, Linkedin, Youtube, Heart, Twitter, Mail } from 'lucide-react';

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
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/SciAmrSherif',
    Icon: Twitter,
    className: 'hover:border-stone-400 hover:text-stone-900 dark:hover:border-stone-500 dark:hover:text-white'
  },
  {
    label: 'Patreon',
    href: 'https://www.patreon.com/c/SciAmrSherif',
    Icon: Heart,
    className: 'hover:border-amber-300 hover:text-amber-700 dark:hover:border-amber-800 dark:hover:text-amber-400'
  },
  {
    label: 'Email',
    href: 'mailto:amrsherifbusiness@gmail.com',
    Icon: Mail,
    className: 'hover:border-teal-300 hover:text-teal-700 dark:hover:border-teal-800 dark:hover:text-teal-400'
  }
] as const;

export function SocialLinks() {
  return (
    <section
      aria-labelledby="social-links-heading"
      className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 shadow-inner text-stone-100"
    >
      <h3
        id="social-links-heading"
        className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5"
      >
        <span>Connect with the Creator</span>
      </h3>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {SOCIAL_LINKS.map(({ label, href, Icon, className }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit the creator on ${label} (opens in a new tab)`}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/90 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white hover:border-teal-500/50 hover:bg-stone-800 transition-all ${className}`}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
