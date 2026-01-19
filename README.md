# MOLD3D.cl - E-commerce Website

Sitio web profesional de e-commerce para MOLD3D, empresa de impresión 3D en Chile.

## 🚀 Características

- ✅ Catálogo de productos dinámico
- ✅ Carrito de compras con persistencia
- ✅ Integración con WhatsApp para pedidos
- ✅ Diseño responsive (móvil y desktop)
- ✅ Gestión de variantes de productos
- ✅ Animaciones modernas y suaves
- ✅ SEO optimizado

## 📦 Tecnologías

- HTML5
- CSS3 (Vanilla CSS con diseño moderno)
- JavaScript (Vanilla JS)
- JSON para datos de productos

## 🛠️ Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/Benjamin-solis/mold3d.git
cd mold3d
```

2. Inicia un servidor local:
```bash
python3 -m http.server 8000
```

3. Abre tu navegador en: `http://localhost:8000`

## 📝 Gestión de Productos

Para agregar o editar productos, modifica el archivo `data/products.json`:

```json
{
  "id": "prod-XXX",
  "name": "Nombre del Producto",
  "description": "Descripción",
  "price": 15990,
  "image": "assets/images/producto.png",
  "category": "Categoría",
  "variants": [
    {
      "name": "Color",
      "options": ["Negro", "Blanco", "Naranja"]
    }
  ]
}
```

## 📱 Configuración WhatsApp

Para cambiar el número de WhatsApp, edita `js/cart.js`:

```javascript
const WHATSAPP_NUMBER = '56973023478'; // Cambia aquí
```

## 🎨 Personalización

### Colores
Edita las variables CSS en `css/styles.css`:

```css
:root {
  --color-primary: #FF6B35;
  --color-secondary: #0A1929;
  --color-accent: #00D4FF;
}
```

## 📂 Estructura del Proyecto

```
mold3d/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos completos
├── js/
│   ├── app.js          # Lógica principal
│   ├── products.js     # Gestión de productos
│   └── cart.js         # Carrito y WhatsApp
├── data/
│   └── products.json   # Catálogo de productos
└── assets/
    └── images/         # Imágenes de productos
```

## 🚀 Despliegue

Este sitio puede desplegarse en:
- GitHub Pages
- Netlify
- Vercel
- Cualquier hosting estático

## 📄 Licencia

© 2026 MOLD3D.cl - Todos los derechos reservados

## 📞 Contacto

- WhatsApp: +56 9 7302 3478
- Email: contacto@mold3d.cl
