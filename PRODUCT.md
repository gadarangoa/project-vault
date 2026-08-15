# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Uso personal y privado (confirmado por el propietario): una persona guarda y consulta sus propios secretos y credenciales, sin cuentas de equipo ni servicios externos.

## Product Purpose

Administrador personal de secretos y credenciales que funciona 100 % en el navegador. Existe para guardar de forma local y privada variables de entorno y credenciales de acceso organizadas por proyecto, sin servidor, cuenta ni nube.

## Positioning

Local por defecto (los datos viven solo en el perfil del navegador, vía SQLite en WASM + IndexedDB) y, a la vez, organizado por proyectos con tags de color, búsqueda y filtros. Ambos son diferenciadores confirmados frente a un gestor de contraseñas genérico.

## Operating Context

- Interfaz y textos en español.
- Se usa desde un navegador de escritorio; los datos sobreviven a recargas pero viven en el perfil del navegador (IndexedDB), no se comparten entre navegadores ni máquinas.
- Flujos: crear/editar/eliminar proyectos; secretos de tipo variable de entorno (clave/valor) o credencial (usuario/email/contraseña); tags de color compartidos por proyecto; búsqueda y filtrado por tag; copiar y mostrar/ocultar valores; notas por secreto; tema claro/oscuro.
- Despliegue: imagen Docker (build estático → nginx), puerto 8080 por defecto vía docker-compose.

## Capabilities and Constraints

- Funcionalidad confirmada: CRUD de proyectos; secretos env y credenciales; notas; tags con color; filtro por tag; búsqueda; copiar y revelar valores; modo oscuro.
- Sin backend: toda la persistencia es local en el navegador (sql.js → IndexedDB, store `secret-vault-db`, key `main`).
- Reglas de implementación conocidas: cargar la base con `new SQL.Database(data)` (no existe `db.importFromBuffer` en `@types/sql.js`); toda mutación debe `await saveDatabase()`; esquema con `PRAGMA foreign_keys = ON` y `ON DELETE CASCADE`.
- Decisión confirmada pendiente de implementar: export/import de la base a un archivo para respaldo/restauración.

## Brand Commitments

- Nombre del producto: «Secret Vault — Administrador de secretos».
- Interfaz y textos en español.

## Evidence on Hand

- Implementación funcional actual (código en `src/`; capa de datos en `src/lib/db.ts` y `src/lib/repository.ts`).
- No existen testimonios, casos de estudio ni prensa; el trabajo futuro no debe fabricarlos.

## Product Principles

1. Privacidad por defecto: los datos viven solo en el navegador; sin cuenta, servidor ni telemetría.
2. El contexto lo da el proyecto: los secretos se organizan por proyecto y tags, no en una lista plana.
3. Confianza en el acceso: los valores sensibles se ocultan por defecto y solo se copian o revelan por acción explícita del usuario.
4. Persistencia robusta: cada mutación se guarda y el esquema mantiene integridad referencial (FK + CASCADE).
5. Autonomía sobre los propios datos: el usuario debe poder respaldar y restaurar su base (export/import confirmado como siguiente paso).
