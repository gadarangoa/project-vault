---
name: Secret Vault
description: Administrador personal de secretos y credenciales, local y discreto
colors:
  tinta: "oklch(0.205 0 0)"
  tinta-clara: "oklch(0.922 0 0)"
  papel: "oklch(1 0 0)"
  papel-oscuro: "oklch(0.145 0 0)"
  nieve: "oklch(0.985 0 0)"
  bruma: "oklch(0.97 0 0)"
  bruma-oscura: "oklch(0.269 0 0)"
  niebla: "oklch(0.556 0 0)"
  niebla-oscura: "oklch(0.708 0 0)"
  ceniza: "oklch(0.922 0 0)"
  humo: "oklch(0.708 0 0)"
  humo-oscuro: "oklch(0.556 0 0)"
  alarma: "oklch(0.577 0.245 27.325)"
  alarma-oscura: "oklch(0.704 0.191 22.216)"
  azul-etiqueta: "oklch(0.623 0.214 259.815)"
  verde-etiqueta: "oklch(0.696 0.17 162.48)"
  ambar-etiqueta: "oklch(0.769 0.188 70.08)"
  rojo-etiqueta: "oklch(0.637 0.237 25.331)"
  violeta-etiqueta: "oklch(0.541 0.281 293.009)"
  cian-etiqueta: "oklch(0.715 0.143 215.221)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "999px"
spacing:
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "3.5": "14px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.nieve}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-destructive:
    backgroundColor: "color-mix(in oklab, {colors.alarma} 10%, transparent)"
    textColor: "{colors.alarma}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  badge:
    backgroundColor: "{colors.bruma}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "0 8px"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  tag-blue:
    backgroundColor: "color-mix(in oklab, {colors.azul-etiqueta} 10%, transparent)"
    textColor: "oklch(0.546 0.245 262.881)"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "0 8px"
---

# Design System: Secret Vault

## Overview

**Creative North Star: "La Bóveda Silenciosa"**

Secret Vault es una bóveda discreta incrustada en la pared: superficies tranquilas, sin ornamentación, donde la calma misma comunica seguridad. El sistema es casi monocromo —grises puros de tinta y papel— y mantiene todo el color para lo que lo merece: la señal destructiva y las etiquetas de organización. Nada grita; cada detalle trabaja en silencio.

La voz es de **discreción profesional**: densidad media, jerarquía construida con espaciado y bordes en lugar de sombras o gradientes, y una única decisión cromática fuerte en cada pantalla. Este es un producto de modo Operate — el usuario viene a guardar o recuperar un secreto rápido y sin fricción, y la interfaz se aparta de su camino. La confianza se construye con precisión tipográfica, señales de estado claras y la promesa de que los valores sensibles permanecen ocultos hasta que se piden explícitamente.

**Key Characteristics:**
- Monocromo por defecto; el color aparece solo en la alarma destructiva y en la paleta de etiquetas.
- Profundidad por líneas y tonos (bordes, `bg-muted`); sombras reservadas para capas flotantes.
- Radios contenidos (6–14px) con píldoras para badges y etiquetas.
- Valores de secretos siempre en fuente mono, enmascarados por defecto.
- Ritmo de espaciado 6–24px; tarjetas en grid 1/2/3 columnas según ancho.

## Colors

Una paleta de tinta y papel: neutros puros sin croma (L 0.145–1.0) que se invierten con elegancia en tema oscuro, un único acento de alarma y una paleta de seis etiquetas para organización. El sistema evita deliberadamente el color decorativo.

### Primary
- **Tinta** (`oklch(0.205 0 0)`, claro) / **Tinta Clara** (`oklch(0.922 0 0)`, oscuro): el único "acento" del sistema — un gris casi negro (o casi blanco en oscuro). Rige el botón primario, el proyecto seleccionado en la sidebar y el logo. El Primary no es un color emocional; es presencia: lo que está seleccionado o es la acción principal.

### Neutral
- **Papel** (`oklch(1 0 0)`) / **Papel Oscuro** (`oklch(0.145 0 0)`): fondo de la aplicación.
- **Nieve** (`oklch(0.985 0 0)`) / **Nieve Oscura** (`oklch(0.205 0 0)`): fondo de la sidebar en claro (oscuro: superficie de tarjeta). Texto sobre Primary.
- **Bruma** (`oklch(0.97 0 0)`) / **Bruma Oscura** (`oklch(0.269 0 0)`): `secondary`, `muted` y `accent` — superficies secundarias, hovers, iconos en caja.
- **Niebla** (`oklch(0.556 0 0)`) / **Niebla Oscura** (`oklch(0.708 0 0)`): `muted-foreground` — texto secundario, placeholders, descripciones, contador de secretos.
- **Ceniza** (`oklch(0.922 0 0)`) / **Borde Oscuro** (`oklch(1 0 0 / 10%)`): `border` e `input` — la línea que define superficies.
- **Humo** (`oklch(0.708 0 0)`) / **Humo Oscuro** (`oklch(0.556 0 0)`): `ring` — el anillo de foco.

### Destructive
- **Alarma** (`oklch(0.577 0.245 27.325)`) / **Alarma Oscura** (`oklch(0.704 0.191 22.216)`): el único rojo del sistema, reservado para acciones destructivas y errores. Se aplica en dosis bajas (fondo al 10%, texto alarma) en botones; el texto de etiqueta mantiene el tinte en hovers.

### Tag Palette (organización)
- **Azul Etiqueta** (`oklch(0.623 0.214 259.815)`), **Verde Etiqueta** (`oklch(0.696 0.17 162.48)`), **Ámbar Etiqueta** (`oklch(0.769 0.188 70.08)`), **Rojo Etiqueta** (`oklch(0.637 0.237 25.331)`), **Violeta Etiqueta** (`oklch(0.541 0.281 293.009)`), **Cian Etiqueta** (`oklch(0.715 0.143 215.221)`): los badges de tag usan el tono al 10% de fondo, 30% en el borde y el texto en el tono 600 (claro) / 400 (oscuro). Es la única área donde el sistema acepta croma múltiple.

### Named Rules
**La Regla del Silencio.** El color decorativo está prohibido. Todo lo que no sea alarma, tag o estado debe vivir en grises puros. Un píxel cromático fuera de su rol es ruido.

## Typography

**Display/UI Font:** ui-sans-serif / system-ui (sin webfonts; se confía en la fuente del sistema)
**Mono Font:** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas (valores de secretos)

**Character:** tipografía de sistema, neutral y legible, sin personalidad declarada — la tipografía debe desaparecer para que los datos protagonicen. La jerarquía se apoya en peso (500/600) y tamaño (12–20px), no en color ni en mayúsculas agresivas.

### Hierarchy
- **Display** (600, 20px, 1.25): encabezados de pantalla vacía ("Selecciona un proyecto").
- **Title** (600, 18px, 1.25): nombre del proyecto en el header, títulos de diálogos (base 16px).
- **Body** (400, 14px, 1.5): el texto dominante — filas de secretos, descripciones, menús.
- **Label** (500, 12px, 1): etiquetas de campo, sección "Proyectos (n)", contadores, texto pequeño de UI.
- **Mono** (400, 14px, `font-mono`): clave/valor de secretos, siempre con `truncate`; es la única fuente de datos.

### Named Rules
**La Regla del Mono Secreto.** Cualquier valor que sea material sensible (clave, contraseña, token) se renderiza en fuente mono y se enmascara por defecto. Si no es mono, no es un secreto.

## Layout

App de escritorio de dos columnas fijas: **sidebar de 256px** (`w-64`) con borde derecho y fondo `bg-muted/30`, y un **main** flexible (`flex-1`) con header propio.

- **Header** (`border-b`, padding 24px horizontal / 16px vertical): icono de carpeta + nombre del proyecto + descripción a la izquierda; acciones (menú contextual) a la derecha.
- **Contenido** (`px-6 py-5`, columna `gap-4`): barra de búsqueda (icono al inicio), filtros de tags (`gap-1.5`), fila de estado con contador, y la grilla de secretos.
- **Grilla de secretos**: 1 columna (móvil) → 2 (`md`) → 3 (`xl`), `gap-3`, tarjetas de `rounded-xl`.
- **Ritmo de espaciado**: 6px (`gap-1.5`), 8px (`gap-2`), 12px (`gap-3`), 14px (`p-3.5` en tarjetas), 16px (`gap-4`), 24px (`px-6 py-5`).
- **Breakpoints**: `sm` 640, `md` 768, `lg` 1024, `xl` 1280 (Tailwind por defecto).

## Elevation & Depth

Filosofía **híbrida**: superficies planas en reposo donde la profundidad la dan los bordes (`border`, `border-b`) y los cambios de tono (`bg-muted`); la sombra aparece únicamente para separar capas flotantes del documento.

- **Overlay de diálogos**: scrim `bg-black/10` con `backdrop-blur-xs`, diálogo con `ring-1 ring-foreground/10` — la separación es por línea y tinte, no por sombra profunda.
- **Menús y dropdowns**: `shadow-md` con `ring-1 ring-foreground/10` (`rounded-lg`, `bg-popover`).
- **Submenús**: `shadow-lg`.
- **Tarjetas de secretos**: planas por completo — `border` + `bg-card` es toda la elevación que necesitan.

### Shadow Vocabulary
- **Floating-low** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): menús, dropdowns.
- **Floating-high** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): submenús.
- **Hairline** (`0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)`): el `ring-1` que enmarca popovers y diálogos.

### Named Rules
**La Regla Plana Por Defecto.** Las superficies están planas en reposo. Una tarjeta de secreto jamás tiene sombra; la sombra es una respuesta a estado (flotación, apertura), no una decoración permanente.

## Shapes

Lenguaje de forma contenido y legible: radios pequeños-medios para control y contenedor, píldoras para badges y tags.

- **Controles** (botones, inputs): `rounded-lg` → 8px (`--radius-md`).
- **Tarjetas**: `rounded-xl` → 14px.
- **Diálogos/popovers**: `rounded-xl` → 14px; el pie del AlertDialog se separa con `border-t` + `bg-muted/50`.
- **Badges y tags**: `rounded-4xl` → píldora completa (999px).
- **Iconos en caja** (logo, tipo de secreto): `rounded-lg` (8px), 32px, `bg-muted` o `bg-primary`.
- **Bordes**: 1px, `border-border` (ceniza), nunca más gruesos.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px), altura 32px por defecto (h-8), 28px sm, 24px xs, iconos cuadrados (24–36px).
- **Primary:** fondo **Tinta** (`var(--primary)`), texto **Nieve** (`var(--primary-foreground)`), padding `0 12px`, gap 6px con el icono. Hover: opacidad 80%.
- **Outline:** fondo `var(--background)`, borde `var(--border)`, texto `var(--foreground)`. Hover: `bg-muted`.
- **Ghost:** sin fondo; hover `bg-muted`. Es el estándar para botones de icono del header y cards.
- **Destructive:** la **La Regla del Susurro** — fondo alarma al 10%, texto alarma (`bg-destructive/10 text-destructive`); nunca un botón lleno de rojo.
- **Focus:** anillo `var(--ring)` al 50% (`focus-visible:ring-ring/50`).

### Badges / Chips
- **Style:** píldora, altura 20px (`h-5`), padding `0 8px`, texto 12px 500, `items-center justify-center`.
- **Estados:** `secondary` (bruma/tinta) para contadores; tags de color con fondo 10% + borde 30% + texto 600/400; filtro activo añade `ring-2 ring-ring`; "Todos" con `bg-primary text-primary-foreground` cuando está seleccionado.

### Cards / Containers
- **Corner Style:** `rounded-xl` (14px).
- **Background:** `bg-card` (papel / tarjeta oscura).
- **Shadow Strategy:** ninguna en reposo (ver La Regla Plana Por Defecto).
- **Border:** 1px `border-border`.
- **Internal Padding:** 14px (`p-3.5`), `gap-2.5`. Encabezado con icono de tipo (env → `Braces`, credencial → `KeyRound`), título 14px 500 + subtítulo 12px muted; filas de valor `bg-muted/50` con `font-mono` y acciones de copiar/ver; notas `line-clamp-2` 12px; tags al pie con `gap-1.5`.

### Inputs / Fields
- **Style:** `rounded-lg` (8px), altura 32px, borde `var(--input)`, fondo `var(--background)`. Búsqueda con icono absoluto a la izquierda y `pl-8`.
- **Focus:** borde `var(--ring)` + anillo `ring-ring/50` de 3px (`focus-visible:ring-3`).
- **Error / Disabled:** `aria-invalid` pinta borde y anillo `--destructive`; disabled al 50% de opacidad.

### Navigation (Sidebar)
- **Style:** columna de 256px, `bg-muted/30`, borde derecho; logo 32px `bg-primary` con icono Vault.
- **Items de proyecto:** `rounded-lg`, 8px de padding vertical, texto 14px. Seleccionado: `bg-primary text-primary-foreground` con icono de carpeta abierta. Sin seleccionar: `text-muted-foreground`, hover `bg-muted` + `text-foreground`. Toggle al hacer clic en el proyecto activo lo deselecciona.

### Dialogs / Overlays
- **Style:** `rounded-xl`, `bg-popover`, `ring-1 ring-foreground/10`, scrim `bg-black/10` + blur. Anchos `sm:max-w-md` (formularios), `sm:max-w-xl` (editor de secreto).
- **AlertDialog:** título 16px 500 + descripción 14px muted centrados (móvil) o a la izquierda (sm+); pie con `border-t` + `bg-muted/50`; acción destructiva con `variant="destructive"`.

## Do's and Don'ts

### Do:
- **Do** usar `bg-primary text-primary-foreground` para el proyecto seleccionado y el botón primario; son la única presencia "llena" del sistema.
- **Do** enmascarar valores sensibles por defecto y revelar solo por acción explícita (`Eye`), con copia al portapapeles.
- **Do** aplicar el rojo destructivo en dosis bajas (`bg-destructive/10 text-destructive`).
- **Do** separar superficies con bordes de 1px `border-border` o tonos `bg-muted` antes que con sombras.
- **Do** renderizar claves y valores de secretos en `font-mono` con `truncate`.
- **Do** usar radios contenidos (6–14px) y reservar la píldora completa para badges y tags.

### Don't:
- **Don't** usar color decorativo fuera de la alarma y la paleta de tags (La Regla del Silencio).
- **Don't** aplicar sombras a tarjetas o superficies en reposo.
- **Don't** usar un botón destructivo lleno de rojo; la señal destructiva es tenue y textual.
- **Don't** revelar valores sensibles automáticamente ni en los resúmenes de tarjeta.
- **Don't** añadir webfonts o tipografía de marca; la fuente del sistema es la voz tipográfica.
