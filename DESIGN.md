# Design System: Project Vault

## Dirección visual

Project Vault es una bóveda local futurista para usuarios técnicos. La atmósfera combina navy profundo, superficies de vidrio suave y una señal cian eléctrica. El futurismo debe sentirse como una interfaz de control limpia, no como un panel saturado de neón: la información sensible conserva el mayor contraste y la decoración queda en el fondo.

- **Densidad:** equilibrada, con tarjetas compactas para datos y espacio alrededor de cada grupo.
- **Variación:** moderada; composición estable con pequeños cambios de profundidad y luz.
- **Movimiento:** fluido y corto; entrada con transform, opacity y blur; salida discreta.
- **Firma visual:** ambientación radial navy-violeta detrás de paneles translúcidos cian.

## Paleta

- **Navy base:** `#111A32` — fondo oscuro principal.
- **Navy surface:** `#1B2848` — tarjetas, sidebar y diálogos.
- **Ice surface:** `#F0F5FA` — fondo claro.
- **Text primary:** `#EAF4FF` en oscuro, `#18243D` en claro.
- **Text muted:** `#A9BED8` en oscuro, `#51627D` en claro.
- **Cyan signal:** `#61D9E8` — acciones, foco, selección y marca.
- **Violet atmosphere:** `#9B8AFB` — solo para gradientes ambientales, nunca como texto principal.
- **Success:** verde suave para confirmaciones de copia y guardado.
- **Destructive:** rojo coral para acciones irreversibles.

Los gradientes son atmosféricos y de baja opacidad. No usar gradientes en texto ni botones. El cian es el único color funcional fuerte; el violeta no comunica estado.

## Tipografía

- **Interfaz:** `ui-sans-serif, system-ui, sans-serif`, 14px, line-height 1.5.
- **Valores sensibles:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`, 14px.
- **Títulos:** 18–20px, peso 600, tracking ligeramente negativo.
- **Metadatos:** 12px, peso 500, color muted.
- Mantener párrafos descriptivos alrededor de 65 caracteres por línea.

## Materiales y componentes

### Glass panels

Los paneles principales usan fondo semitransparente, `backdrop-filter: blur(18px) saturate(125%)` y borde de 1px con tinte cian. Si el usuario reduce transparencia, cambiar a una superficie sólida equivalente.

### Tarjetas

Las tarjetas de secretos, notas y grupos usan `glass-panel` y `futuristic-card`: borde suave, radio de 14px, sombra amplia de baja opacidad y elevación de 2px al hover. Nunca usar sombras negras duras.

### Acciones

El botón primario usa cian con texto navy. Los botones secundarios permanecen neutros y los destructivos usan coral en dosis baja. Todos tienen foco visible y feedback de presión.

### Datos sensibles

Las contraseñas, tokens y valores permanecen ocultos. La revelación y copia son acciones explícitas, con iconos accesibles y confirmación visual breve.

## Layout y responsive

- Sidebar de 256px en escritorio, apilada en móvil.
- Todas las páginas comparten `max-width: 1152px`, `width: 100%` y centrado horizontal.
- Grid de secretos, notas y grupos: 1 columna móvil, 2 tablet, 3 escritorio amplio.
- Gutters de 16px en móvil y 24px en escritorio.
- No debe existir scroll horizontal.

## Motion

- Entrada de páginas y listas: 220–300ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- Entrada de tarjetas: `opacity`, `transform` y blur corto; stagger máximo de 35ms por elemento.
- Hover de tarjeta: translateY de 2px y sombra cian muy sutil.
- No animar width, height, top o left.
- Con `prefers-reduced-motion`, eliminar blur, transform y transiciones decorativas.

## Anti-patrones

- No convertir toda la interfaz en neón.
- No usar glassmorphism sin contraste ni fallback sólido.
- No usar glow alrededor de cada control.
- No usar emojis como iconos.
- No revelar secretos automáticamente.
- No usar copy genérico de IA como “Seamless”, “Next-Gen” o “Eleva”.
- No sacrificar legibilidad, foco de teclado o contraste por estética.
