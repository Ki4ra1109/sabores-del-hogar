CREATE TABLE "usuario" (
  "id_usuario" int PRIMARY KEY,
  "nombre" varchar,
  "apellido" varchar,
  "correo" varchar,
  "contraseña" varchar,
  "rut" varchar,
  "telefono" varchar,
  "fecha_nacimiento" date,
  "direccion" varchar,
  "rol" varchar,
  "fecha_registro" datetime
);

CREATE TABLE "producto" (
  "sku" varchar PRIMARY KEY,
  "nombre" varchar,
  "descripcion" text,
  "precio" decimal,
  "categoria" varchar,
  "stock" int,
  "puntuacion_promedio" decimal,
  "imagen_url" varchar,
  "estado" varchar
);

CREATE TABLE "pedido" (
  "id_pedido" int PRIMARY KEY,
  "id_usuario" int,
  "estado" varchar,
  "total" decimal,
  "fecha_pedido" datetime,
  "codigo_descuento" int,
  "fecha_entrega" date
);

CREATE TABLE "detalle_pedido" (
  "id_detalle" int PRIMARY KEY,
  "id_pedido" int,
  "sku" varchar,
  "cantidad" int,
  "precio_unitario" decimal
);

CREATE TABLE "postre_personalizado" (
  "id_postre" int PRIMARY KEY,
  "id_detalle" int,
  "tipo" enum(torta,cupcake,tartaleta),
  "cantidad" int,
  "bizcocho" varchar,
  "relleno" varchar,
  "crema" varchar,
  "frutas" text,
  "decoracion" varchar,
  "mensaje_torta" varchar,
  "extras" text
);

CREATE TABLE "pago" (
  "id_pago" int PRIMARY KEY,
  "id_pedido" int,
  "metodo_pago" varchar,
  "monto" decimal,
  "fecha_pago" datetime,
  "estado_pago" varchar
);

CREATE TABLE "descuentos" (
  "id_descuento" int PRIMARY KEY,
  "codigo" varchar,
  "porcentaje" decimal,
  "fecha_inicio" date,
  "fecha_fin" date,
  "uso_unico" boolean
);

CREATE TABLE "registro_ventas" (
  "id_registro" int PRIMARY KEY,
  "fecha" date,
  "ventas_totales" decimal,
  "cantidad_pedidos" int,
  "producto_mas_vendido" varchar
);

ALTER TABLE "pedido" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuario" ("id_usuario");

ALTER TABLE "pedido" ADD FOREIGN KEY ("codigo_descuento") REFERENCES "descuentos" ("id_descuento");

ALTER TABLE "detalle_pedido" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedido" ("id_pedido");

ALTER TABLE "detalle_pedido" ADD FOREIGN KEY ("sku") REFERENCES "producto" ("sku");

ALTER TABLE "postre_personalizado" ADD FOREIGN KEY ("id_detalle") REFERENCES "detalle_pedido" ("id_detalle");

ALTER TABLE "pago" ADD FOREIGN KEY ("id_pedido") REFERENCES "pedido" ("id_pedido");

ALTER TABLE "registro_ventas" ADD FOREIGN KEY ("producto_mas_vendido") REFERENCES "producto" ("sku");
