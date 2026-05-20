import { useNavigate } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { LoginForm } from "@/features/auth";
import { usePageTitle } from "@/shared/hooks/use-page-title";

const QUOTES = [
  { text: "Frankamente, minha cara, não me importo nem um pouco.", author: "Rhett Butler — E o Vento Levou (1939)" },
  { text: "Vou fazer a ele uma oferta que ele não poderá recusar.", author: "Vito Corleone — O Poderoso Chefão (1972)" },
  { text: "Você não entende! Eu podia ter chegado lá. Eu podia ter sido um contendor.", author: "Terry Malloy — On the Waterfront (1954)" },
  { text: "Totó, tenho a sensação de que não estamos mais no Kansas.", author: "Dorothy Gale — O Mágico de Oz (1939)" },
  { text: "Aqui está um brinde a você, garota.", author: "Rick Blaine — Casablanca (1942)" },
  { text: "Vai em frente, alegra o meu dia.", author: "Harry Callahan — Sudden Impact (1983)" },
  { text: "Que a Força esteja com você.", author: "Han Solo — Star Wars (1977)" },
  { text: "Você está falando comigo?", author: "Travis Bickle — Taxi Driver (1976)" },
  { text: "O que temos aqui é uma falha de comunicação.", author: "Capitão — Rebeldia Indomável (1967)" },
  { text: "Adoro o cheiro de napalm de manhã.", author: "Cel. Kilgore — Apocalypse Now (1979)" },
  { text: "Estou com raiva como o inferno e não vou aguentar mais isso!", author: "Howard Beale — Network (1976)" },
  { text: "Bond. James Bond.", author: "James Bond — Dr. No (1962)" },
  { text: "Sou grande! São as imagens que ficaram pequenas.", author: "Norma Desmond — Crepúsculo dos Deuses (1950)" },
  { text: "Você vai precisar de um barco maior.", author: "Martin Brody — Tubarão (1975)" },
  { text: "Estarei de volta.", author: "O Exterminador — O Exterminador do Futuro (1984)" },
  { text: "Você não aguenta a verdade!", author: "Cel. Jessup — Questão de Honra (1992)" },
  { text: "Ganância, por falta de palavra melhor, é boa.", author: "Gordon Gekko — Wall Street (1987)" },
  { text: "Diga olá ao meu pequeno amigo!", author: "Tony Montana — Scarface (1983)" },
  { text: "Aqui está o Johnny!", author: "Jack Torrance — O Iluminado (1980)" },
  { text: "Abra as portas do compartimento, HAL.", author: "Dave Bowman — 2001: Uma Odisseia no Espaço (1968)" },
]

const RANDOM_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)]!

export function LoginPage() {
  usePageTitle('Login')
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate({ to: "/discovery" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-card border-r border-border p-12">
        <div className="flex items-center gap-3">
          <Film className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-mono text-lg font-bold uppercase tracking-widest text-primary">
            Cinedash
          </span>
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-3">
            <p className="text-2xl font-semibold leading-snug text-foreground">
              "{RANDOM_QUOTE.text}"
            </p>
            <footer className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              — {RANDOM_QUOTE.author}
            </footer>
          </blockquote>
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          Dashboard de curadoria de filmes via TMDB API.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo — visível só em mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="font-mono text-base font-bold uppercase tracking-widest text-primary">
              Cinedash
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta para continuar
            </p>
          </div>

          <LoginForm onSuccess={handleSuccess} />

          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Use qualquer email e senha com 6+ caracteres
          </p>
        </div>
      </main>
    </div>
  );
}
