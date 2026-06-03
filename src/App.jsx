import PantauKrisisDashboard from './PantauKrisisDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PantauKrisisDashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}
