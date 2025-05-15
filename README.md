<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# **Cocos Challenge API**

## Descripción

Esta API está desarrollada utilizando el framework [NestJS](https://nestjs.com/) y TypeORM para el manejo de los datos. Proporciona funcionalidades relacionadas con la gestión de portafolios, crear órdenes y buscar instrumentos. Es una solución modular y escalable diseñada para manejar operaciones financieras.

## Módulos principales

### **Portfolio Module**
- **Descripción:** Gestiona los portafolios de los usuarios, permitiendo la consulta de portafolios.
- **Funciones principales:**
  - Devuelve el portfolio del usuario con los siguientes datos: valor total, cash disponible y los instrumentos que posee
  - Cada instrumento devuelve la información de la cantidad, ticker, nombre de la compañía, valor total de mercado de la posición y el rendimiento.

### **Orders Module**
- **Descripción:** Maneja las órdenes de compra y venta de instrumentos financieros.
- **Funciones principales:**
  - Crear una nueva orden por tipo MARKET o LIMIT y realiza validaciones previas en cuanto al monto disponible para invertir y la catidad de acciones disponibles al momento de vender.

### **Instruments Module**
- **Descripción:** Realiza la búsqueda instumentos por ticker o nombre y si no recibe paramentros, devuelve el listado completo.
- **Funciones principales:**
  - Listar instrumentos financieros de acuerdo a los filtros (ticker, name)


## Comandos útiles

### **Instalar dependencias**
```bash
npm install
```

### **Compilar y ejecutar el proyecto**
```bash
# Modo desarrollo
npm run start

# Modo watch (desarrollo continuo)
npm run start:dev

# Modo producción
npm run start:prod
```

### **Ejecutar pruebas**
```bash
# Pruebas unitarias
npm run test

# Pruebas end-to-end (e2e)
npm run test:e2e

# Pruebas unitarias y end-to-end
npm run test:all

# Pruebas unitarias y end-to-end con coverage
npm run test:cov:all
```

### **Construir el proyecto**
```bash
npm run build
```

## Recursos adicionales
- Se deja en la raiz del proyecto un archivo `CocosChallenge.postman_collection.json` con una colección para ejecutar los request de los endpoints disponibles en la API.

### Descripcion de los request de postman


- **Get portfolio**: 
  - Devuelve el portafolio por usuario
- **Search instuments by name or ticker**: 
  - Devuelve los intrumentos filtrados por nombre, ticker o ambos.
- **Get ALL instuments**: 
  - Devuelve un listado con todos los instrumentos.
- **Create Order BUY - CASH IN**: 
  - Genera órden de ingreso de dinero
- **Create Order BUY - CASH OUT**: 
  - Genera órden de retiro de dinero
- **Create Order BUY - LIMIT**: 
  - Genera órden de compra con precio limite
- **Create Order BUY - MARKET**: 
  - Genera órden de compra con precio de mercado
- **Create Order SELL - LIMIT**: 
  - Genera órden de venta con precio limite
- **Create Order SELL - MARKET**: 
  - Genera órden de venta con precio de mercado
