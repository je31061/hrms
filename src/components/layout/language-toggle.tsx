'use client';

import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useT } from '@/lib/i18n/use-translation';

export function LanguageToggle() {
  const { t, locale } = useT();
  const updateDisplay = useSettingsStore((s) => s.updateDisplay);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2.5">
          <Languages className="h-4 w-4" />
          <span className="text-xs font-medium">
            {locale === 'ko' ? t('language.label.ko') : t('language.label.en')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => updateDisplay({ locale: 'ko' })}
          className={locale === 'ko' ? 'font-semibold' : ''}
        >
          {t('language.korean')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => updateDisplay({ locale: 'en' })}
          className={locale === 'en' ? 'font-semibold' : ''}
        >
          {t('language.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
