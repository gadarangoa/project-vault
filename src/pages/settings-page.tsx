import { Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import { useAppearance, type AppearanceMode, type AppearancePalette } from "@/components/appearance-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const modes: Array<{ value: AppearanceMode; label: string; description: string; icon: typeof Monitor }> = [
  { value: "system", label: "Sistema", description: "Sigue la preferencia del dispositivo", icon: Monitor },
  { value: "light", label: "Claro", description: "Superficies luminosas para el día", icon: Sun },
  { value: "dark", label: "Oscuro", description: "Superficies profundas para poca luz", icon: Moon },
];

const palettes: Array<{ value: AppearancePalette; label: string; description: string; swatches: string[] }> = [
  { value: "sepia", label: "Sepia", description: "Cálido, sereno y familiar", swatches: ["bg-[#f5f1e8]", "bg-[#d8b98a]", "bg-[#4a392e]"] },
  { value: "mono", label: "Monocromo", description: "Neutro, sobrio y concentrado", swatches: ["bg-[#f1f0ed]", "bg-[#a7a6a1]", "bg-[#383836]"] },
  { value: "blue", label: "Azul", description: "Fresco, estable y preciso", swatches: ["bg-[#edf3f7]", "bg-[#8baabd]", "bg-[#2f5166]"] },
];

export function SettingsPage() {
  const { mode, palette, resolvedMode, setMode, setPalette } = useAppearance();
  const activeModeLabel = modes.find((item) => item.value === mode)?.label;
  const activePaletteLabel = palettes.find((item) => item.value === palette)?.label;

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-vault-open">
      <header className="glass-panel flex shrink-0 items-center gap-3 border-b bg-vault/5 px-4 py-4 sm:px-6 dark:bg-vault/10">
        <div className="flex size-9 items-center justify-center rounded-xl bg-vault/12 ring-1 ring-vault/25 sm:size-10"><Settings className="size-4 text-vault" /></div>
        <div className="min-w-0"><h1 className="truncate text-lg font-semibold leading-tight tracking-tight">Configuración</h1><p className="truncate text-xs text-muted-foreground">Ajusta tu experiencia en la bóveda</p></div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
          <section className="border-b border-border/70 pb-6"><p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-vault">Preferencias</p><h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Haz tuyo el espacio de trabajo.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Estas preferencias se aplican de inmediato en toda la aplicación y se guardan solo en este dispositivo.</p></section>
          <section className="rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="appearance-heading">
            <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-vault/12 text-vault"><Palette className="size-4" /></span><div><h2 id="appearance-heading" className="text-lg font-semibold tracking-tight">Apariencia</h2><p className="mt-1 text-sm text-muted-foreground">Elige el modo de iluminación y el carácter visual de la interfaz.</p></div></div>
            <div className="mt-6 grid gap-6">
              <div><div className="mb-3"><h3 className="text-sm font-medium">Modo</h3><p className="mt-1 text-xs text-muted-foreground">Actual: {activeModeLabel} ({resolvedMode === "dark" ? "oscuro" : "claro"})</p></div><div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Modo de apariencia">{modes.map((item) => { const Icon = item.icon; const selected = mode === item.value; return <Button key={item.value} type="button" variant={selected ? "secondary" : "outline"} aria-pressed={selected} className={cn("h-auto justify-start gap-3 px-3 py-3 text-left", selected && "border-vault/40 bg-vault/10")} onClick={() => setMode(item.value)}><Icon className={cn("size-4 shrink-0", selected && "text-vault")} /><span className="min-w-0"><span className="block text-sm">{item.label}</span><span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{item.description}</span></span></Button>; })}</div></div>
              <div><div className="mb-3"><h3 className="text-sm font-medium">Estilo de color</h3><p className="mt-1 text-xs text-muted-foreground">Actual: {activePaletteLabel}</p></div><div className="grid gap-3 md:grid-cols-3" role="group" aria-label="Estilo de color">{palettes.map((item) => { const selected = palette === item.value; return <button key={item.value} type="button" aria-pressed={selected} className={cn("group rounded-xl border p-3 text-left transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50", selected ? "border-vault/50 bg-vault/8 ring-1 ring-vault/25" : "hover:border-vault/35 hover:bg-muted/40")} onClick={() => setPalette(item.value)}><span className="flex h-16 overflow-hidden rounded-lg border border-black/10 bg-background dark:border-white/10">{item.swatches.map((swatch) => <span key={swatch} className={cn("flex-1", swatch)} />)}</span><span className="mt-3 flex items-center justify-between gap-2"><span><span className="block text-sm font-medium">{item.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span></span><span className={cn("size-4 rounded-full border-2", selected ? "border-vault bg-vault ring-2 ring-vault/20" : "border-muted-foreground/35")} aria-hidden="true" /></span></button>; })}</div></div>
            </div>
          </section>
          <section className="flex flex-col gap-3 rounded-xl border border-dashed border-border/90 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="font-medium">Preferencia activa</h2><p className="mt-1 text-sm text-muted-foreground">{activePaletteLabel} · modo {activeModeLabel?.toLowerCase()}</p></div><span className="rounded-full border border-vault/25 bg-vault/8 px-2.5 py-1 text-xs font-medium text-vault">Se guarda automáticamente</span></section>
        </div>
      </div>
    </div>
  );
}
