const path = require("path");
const fs = require("fs");
const sequelize = require("../config/db");

// 📁 Directorio donde se guardan imágenes
const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "frontend", "public", "catalogo");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Utilidad segura para números
const num = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};

// Generador de SKU aleatorio
const generarSku = () => {
  const base = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `P-${base}-${rand}`.toUpperCase();
};

// ===========================================================
// 📦 OBTENER TODOS LOS PRODUCTOS (ADMIN)
// ===========================================================
exports.obtenerProductos = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT p.sku, p.nombre, p.descripcion, p.categoria, p.precio,
             p.stock, p.imagen_url, p.estado,
             po.personas, po.precio AS precio_porcion
      FROM producto p
      LEFT JOIN porciones po ON po.sku_producto = p.sku
      ORDER BY p.nombre ASC, po.personas ASC
    `);

    const productos = Object.values(
      rows.reduce((acc, r) => {
        if (!acc[r.sku]) {
          acc[r.sku] = {
            id: r.sku,
            sku: r.sku,
            nombre: r.nombre,
            descripcion: r.descripcion,
            categoria: r.categoria,
            precioMin: r.precio,
            precioMax: r.precio,
            stock: r.stock,
            imagen_url: r.imagen_url || "",
            activo: r.estado === "activo",
            variantes: [],
          };
        }
        if (r.personas) {
          acc[r.sku].variantes.push({
            personas: r.personas,
            precio: r.precio_porcion,
          });
        }
        return acc;
      }, {})
    );

    return res.json(productos);
  } catch (error) {
    console.error("❌ Error obtenerProductos:", error);
    return res.status(500).json({ error: "Error al obtener productos" });
  }
};

// ===========================================================
// 🛍️ OBTENER SOLO PRODUCTOS ACTIVOS (CATÁLOGO PÚBLICO)
// ===========================================================
exports.obtenerProductosActivos = async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT p.sku, p.nombre, p.descripcion, p.categoria, p.precio,
             p.stock, p.imagen_url, p.estado,
             po.personas, po.precio AS precio_porcion
      FROM producto p
      LEFT JOIN porciones po ON po.sku_producto = p.sku
      WHERE p.estado = 'activo'
      ORDER BY p.nombre ASC, po.personas ASC
    `);

    const productos = Object.values(
      rows.reduce((acc, r) => {
        if (!acc[r.sku]) {
          acc[r.sku] = {
            id: r.sku,
            sku: r.sku,
            nombre: r.nombre,
            descripcion: r.descripcion,
            categoria: r.categoria,
            precioMin: r.precio,
            precioMax: r.precio,
            imagen_url: r.imagen_url || "",
            variantes: [],
          };
        }
        if (r.personas) {
          acc[r.sku].variantes.push({
            personas: r.personas,
            precio: r.precio_porcion,
          });
        }
        return acc;
      }, {})
    );

    return res.json(productos);
  } catch (error) {
    console.error("❌ Error obtenerProductosActivos:", error);
    return res.status(500).json({ error: "Error al obtener productos activos" });
  }
};

// ===========================================================
// 🎯 OBTENER PRODUCTO POR SKU (para página de detalle)
// ===========================================================
exports.obtenerProductoPorSku = async (req, res) => {
  try {
    const { sku } = req.params;

    const [[producto]] = await sequelize.query(
      `
      SELECT sku, nombre, descripcion, categoria, precio, stock,
             puntuacion_promedio, imagen_url, estado
      FROM producto
      WHERE sku = :sku
      `,
      { replacements: { sku } }
    );

    if (!producto) {
      return res.status(404).json({ ok: false, message: "Producto no encontrado" });
    }

    // Obtener porciones asociadas
    const [porciones] = await sequelize.query(
      `
      SELECT personas, precio
      FROM porciones
      WHERE sku_producto = :sku
      ORDER BY personas ASC
      `,
      { replacements: { sku } }
    );

    const variantes = Array.isArray(porciones) && porciones.length
      ? porciones.map(p => ({
          personas: p.personas,
          precio: Number(p.precio)
        }))
      : [
          { personas: 12, precio: producto.precio },
          { personas: 18, precio: producto.precio + 6000 },
          { personas: 24, precio: producto.precio + 12000 },
          { personas: 30, precio: producto.precio + 18000 },
          { personas: 50, precio: producto.precio + 24000 },
        ];

    return res.json({
      ...producto,
      precioMin: producto.precio,
      precioMax: Math.max(...variantes.map(v => v.precio)),
      variantes,
    });
  } catch (error) {
    console.error("❌ Error obtenerProductoPorSku:", error);
    return res.status(500).json({ ok: false, message: "Error al obtener producto por SKU" });
  }
};

// ===========================================================
// 🧱 CREAR PRODUCTO (con imagen y porciones)
// ===========================================================
exports.crearProducto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sku, nombre, descripcion, categoria, precioMin, imagen_url, activo, variantes } = req.body;

    const finalSku = sku && sku.trim() ? sku.trim().toUpperCase() : generarSku();
    const precio = num(precioMin, 0);

    // Crear producto base
    await sequelize.query(
      `
      INSERT INTO producto (sku, nombre, descripcion, precio, categoria, stock, imagen_url, estado)
      VALUES (:sku, :nombre, :descripcion, :precio, :categoria, 0, :imagen_url, :estado)
      `,
      {
        replacements: {
          sku: finalSku,
          nombre,
          descripcion: descripcion || null,
          precio,
          categoria,
          imagen_url: imagen_url || null,
          estado: activo ? "activo" : "inactivo",
        },
        transaction: t,
      }
    );

    // Si el front no envía porciones personalizadas, usamos fórmula +6000
    const basePorciones = [12, 18, 24, 30, 50];
    const porciones =
      Array.isArray(variantes) && variantes.length > 0
        ? variantes
        : basePorciones.map((p, i) => ({
            personas: p,
            precio: precio + i * 6000,
          }));

    // Insertar las porciones
    for (const p of porciones) {
      await sequelize.query(
        `INSERT INTO porciones (sku_producto, personas, precio)
         VALUES (:sku, :personas, :precio)`,
        {
          replacements: { sku: finalSku, personas: p.personas, precio: num(p.precio, 0) },
          transaction: t,
        }
      );
    }

    await t.commit();
    return res.json({ ok: true, message: "✅ Producto creado con éxito", sku: finalSku });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error crearProducto:", error);
    if (error.code === "23505") {
      return res.status(400).json({ ok: false, message: "El SKU ya existe" });
    }
    return res.status(500).json({ ok: false, message: "Error al crear producto" });
  }
};

// ===========================================================
// 🧱 ACTUALIZAR PRODUCTO (con actualización de porciones)
// ===========================================================
exports.actualizarProducto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params; // id = sku
    const { nombre, descripcion, categoria, precioMin, imagen_url, activo, variantes } = req.body;

    const precio = num(precioMin, 0);

    // Actualizar producto
    await sequelize.query(
      `
      UPDATE producto
      SET nombre = :nombre,
          descripcion = :descripcion,
          precio = :precio,
          categoria = :categoria,
          imagen_url = :imagen_url,
          estado = :estado
      WHERE sku = :sku
      `,
      {
        replacements: {
          nombre,
          descripcion: descripcion || null,
          precio,
          categoria,
          imagen_url: imagen_url || null,
          estado: activo ? "activo" : "inactivo",
          sku: id,
        },
        transaction: t,
      }
    );

    // Actualizar o insertar porciones
    if (Array.isArray(variantes) && variantes.length) {
      for (const v of variantes) {
        await sequelize.query(
          `
          INSERT INTO porciones (sku_producto, personas, precio)
          VALUES (:sku_producto, :personas, :precio)
          ON CONFLICT (sku_producto, personas)
          DO UPDATE SET precio = EXCLUDED.precio
          `,
          {
            replacements: {
              sku_producto: id,
              personas: v.personas,
              precio: num(v.precio, 0),
            },
            transaction: t,
          }
        );
      }
    }

    await t.commit();
    return res.json({ ok: true, message: "✅ Producto actualizado correctamente" });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error actualizarProducto:", error);
    return res.status(500).json({ ok: false, message: "Error al actualizar producto" });
  }
};

// ===========================================================
// 🗑️ ELIMINAR PRODUCTO
// ===========================================================
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params; // id = sku
    await sequelize.query(`DELETE FROM producto WHERE sku = :sku`, { replacements: { sku: id } });
    return res.json({ ok: true, message: "🗑️ Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error eliminarProducto:", error);
    return res.status(500).json({ ok: false, message: "Error al eliminar producto" });
  }
};

// ===========================================================
// 🖼️ SUBIR IMAGEN DE PRODUCTO
// ===========================================================
exports.subirImagen = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });

    const filename = Date.now() + "_" + req.file.originalname.replace(/\s+/g, "_");
    const dest = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(dest, req.file.buffer);

    const relativePath = `/catalogo/${filename}`;
    return res.json({ ok: true, imagen_url: relativePath });
  } catch (error) {
    console.error("Error subirImagen:", error);
    return res.status(500).json({ ok: false, message: "Error al subir imagen" });
  }
};