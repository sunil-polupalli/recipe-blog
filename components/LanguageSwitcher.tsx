import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locales, locale: activeLocale, asPath } = router;

  return (
    <div className="flex gap-4" data-testid="language-switcher">
      {locales?.map((locale) => (
        <Link
          key={locale}
          href={asPath}
          locale={locale}
          className={`px-3 py-1 rounded ${
            activeLocale === locale
              ? 'bg-blue-600 text-white font-bold'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}