import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage';

const languages = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'FR', label: 'Français' },
  { code: 'DE', label: 'Deutsch' },
  { code: 'IT', label: 'Italiano' },
  { code: 'PT', label: 'Português' },
  { code: 'RU', label: 'Русский' },
  { code: 'ZH', label: '中文' },
  { code: 'JA', label: '日本語' },
  { code: 'KO', label: '한국어' },
];

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 px-0"
        >
          {currentLanguage}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="cursor-pointer"
          >
            <span className="w-6">{lang.code}</span>
            <span className="ml-2">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}