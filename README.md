# Frontend - Sistema de Gestión "Mercado Bolívar"

Aplicación de Página Única (SPA) desarrollada con **Angular** para la interfaz de usuario del sistema de gestión del Mercado Bolívar. 

Este frontend consume la API RESTful del backend y proporciona una experiencia de usuario interactiva y fluida para la administración de socios, puestos, finanzas (pagos y multas) y el control de inventario (Kardex).

---

## Tecnologías y Herramientas

*   **Framework Principal:** Angular (v16+) con arquitectura de Componentes Standalone.
*   **Lenguaje:** TypeScript / HTML5 / CSS3.
*   **Estilos y Diseño:** Tailwind CSS (para utilidades de diseño) y Bootstrap 5 (para componentes interactivos como Modales y Alertas).
*   **Íconos:** Bootstrap Icons (`bi-eye`, `bi-pencil`, `bi-trash`, etc.).
*   **Manejo de Estado y Asincronía:** RxJS (Observables, BehaviorSubjects, pipes).
*   **Autenticación:** JWT (JSON Web Tokens) gestionados en el `localStorage` mediante utilidades como `jwt-decode`.
*   **Peticiones HTTP:** `HttpClientModule` con Interceptores funcionales.

---

## Arquitectura del Proyecto

El proyecto está diseñado de forma modular y escalable, separando claramente la vista de la lógica de negocio:

*   **Componentes (`.component.ts`, `.html`):** Controlan la interfaz de usuario. Usan `Standalone Components` para reducir la dependencia de módulos (NgModules).
*   **Servicios (`.service.ts`):** Clases inyectables con `@Injectable({ providedIn: 'root' })` encargadas de la comunicación con el Backend (peticiones HTTP) y de compartir estado entre componentes.
*   **Modelos/DTOs:** Interfaces TypeScript (ej. `SocioResponseDTO`, `MultaRequestDTO`) que tipan estrictamente los datos que viajan hacia y desde el backend.
*   **Guards (`auth.guard.ts`):** Protegen las rutas para que solo usuarios autenticados puedan acceder al Dashboard.
*   **Interceptors (`jwt-interceptor.ts`):** Interceptores funcionales que inyectan automáticamente el token `Bearer` en las cabeceras de cada petición HTTP saliente.

---

## Módulos Principales (Funcionalidades)

El sistema está dividido en las siguientes secciones dentro del **Dashboard**:

1.  ** Autenticación (`/login`)**
    *   Formulario validado dinámicamente.
    *   Lógica de "Mostrar/Ocultar contraseña".
    *   Redirección basada en roles (`ROLE_ADMIN` vs `ROLE_SOCIO`).
2.  ** Gestión de Socios (`/socios`)**
    *   CRUD completo.
    *   Búsqueda dinámica por nombre, apellido o DNI.
    *   Asignación de Puestos directos desde la creación del socio.
3.  ** Gestión de Puestos (`/puestos`)**
    *   Reglas de negocio UI: Al "Liberar" un puesto, cambia visualmente a estado `INACTIVO`. Al asignar un socio, cambia a `OPERATIVO`.
    *   Transferencias restringidas solo a socios activos y sin puesto.
4.  ** Gestión de Multas (`/multas`)**
    *   Filtros por QueryParams (Pendientes / Pagadas / Todas).
    *   Buscador inteligente integrado en el Modal para asociar la multa a un socio (validación mínima de 3 caracteres).
    *   Bloqueo de edición/eliminación para multas ya `PAGADAS`.
5.  ** Gestión de Pagos (`/pagos`)**
    *   Registro de pagos de cuotas y vinculación directa a multas pendientes.
6.  ** Inventario y Kardex (`/bienes`)**
    *   Sistema de control de stock.
    *   Modal de visualización con Pestañas (Tabs) dinámicas: "Editar Datos" vs "Historial de Movimientos".
    *   Formulario de Entradas (+) y Salidas (-) de stock con cálculo automático.

---

## Configuración y Ejecución Local

### Prerrequisitos
*   Tener instalado Node.js (v18 o superior).
*   Tener instalado Angular CLI (`npm install -g @angular/cli`).
*   Tener el **Backend de Spring Boot en ejecución** (puerto `8080`).

### 1. Instalación de dependencias
Clona el repositorio y abre una terminal en la carpeta del frontend:
```bash
npm install
```

### 2. Ejecutar el servidor de desarrollo
Inicia la aplicación en modo desarrollo:
```bash
ng serve
```
Abre tu navegador y navega a `http://localhost:4200/`. El sistema se recargará automáticamente si haces cambios en el código.

---

## Seguridad y Sesión

*   **Token en LocalStorage:** El servicio `TokenService` guarda el JWT.
*   **BehaviorSubject Global:** `AuthService` mantiene un estado global (`currentUser$`) para reaccionar inmediatamente a los cambios (ej. mostrar el nombre del usuario en el NavBar o cambiar las opciones del Menú Lateral).
*   **Control de Vistas (Roles):** El HTML utiliza sentencias estructurales (`*ngIf="(currentUserRole$ | async) === 'ROLE_ADMIN'"`) para asegurar que un Socio no vea botones o menús administrativos.

---

## Autor

Proyecto desarrollado para la administración digital y optimización de procesos del **Mercado Bolívar**.
