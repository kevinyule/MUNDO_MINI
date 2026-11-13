# Mundo Mini

Sitio web estático para consultar el menú de comidas rápidas, armar un pedido
y enviarlo al negocio por WhatsApp. Hecho con Vue 3 y Vite; no requiere servidor
ni base de datos.

## Requisitos

- Node.js 18 o posterior.
- npm.

## Ejecutar localmente

```powershell
npm install
npm run dev
```

Vite muestra en la terminal la dirección local de la aplicación.

Para comprobar la versión de producción:

```powershell
npm run build
npm run preview
```

## Personalización

- Edita los productos, categorías, precios, número de WhatsApp y la tarifa de
  domicilio en `src/App.vue`.
- Las ilustraciones SVG del menú están en `public/images/`; puedes reemplazarlas
  por fotografías propias manteniendo las rutas correspondientes.

Los precios y la tarifa de domicilio son valores de ejemplo. Confirma los
precios, disponibilidad, cobertura y costo del domicilio con el negocio antes
de publicar el menú.

## Pedidos

El carrito calcula el subtotal, el domicilio y el cambio en efectivo. Antes de
continuar valida los datos requeridos y abre un mensaje de WhatsApp con el
detalle del pedido para que el cliente lo revise y lo envíe. El sitio no guarda
ni registra pedidos en un servidor.
