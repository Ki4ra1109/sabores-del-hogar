// controllers/productoController.js
const sequelize = require("../config/db");
const fs = require("fs");
const path = require("path");

// carpeta pública donde se guardan las imágenes del frontend
const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "frontend", "public", "catalogo");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Guarda una data URI (base64) como archivo y devuelve la ruta pública (/catalogo/...)
const saveDataUriToFile = async (dataUri, skuHint = "") => {
  try {
    const m = String(dataUri).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!m) throw new Error("No es una data URI válida");
    const mime = m[1];
    const b64 = m[2];
    const ext = mime.split("/")[1] || "jpg";
    const safeSku = (skuHint || generateSku()).replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 20);
    const filename = `${safeSku}-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(b64, "base64");
    await fs.promises.writeFile(filepath, buffer);
    return `/catalogo/${filename}`;
  } catch (err) {
    console.error("saveDataUriToFile error:", err);
    throw err;
  }
};

const toNumber = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const generateSku = () => {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `P-${t}-${r}`.toUpperCase();
};

// Crear producto
exports.crearProducto = async (req, res) => {
  try {
    const { sku: bodySku, nombre, categoria, precioMin, precioMax, imagen, imagen_url, descripcion, variantes, activo } = req.body;

    let precio = null;
    const min = toNumber(precioMin);
    const max = toNumber(precioMax);
    if (min != null && max != null) {
      precio = (min + max) / 2;
    } else if (Array.isArray(variantes) && variantes.length > 0 && toNumber(variantes[0].precio) != null) {
      precio = toNumber(variantes[0].precio, 0);
    } else if (min != null) {
      precio = min;
    } else if (max != null) {
      precio = max;
    } else {
      precio = 0;
    }

    const img = (imagen_url || imagen || "").trim();
    const sku = (bodySku && String(bodySku).trim()) ? String(bodySku).trim().toUpperCase() : generateSku();

    let imgPath = img;
    if (imgPath && imgPath.startsWith("data:")) {
      try {
        imgPath = await saveDataUriToFile(imgPath, sku);
      } catch (err) {
        return res.status(400).json({ ok: false, message: "Imagen inválida o no se pudo procesar" });
      }
    }

    const [result] = await sequelize.query(
      `INSERT INTO producto (sku, nombre, descripcion, precio, categoria, stock, puntuacion_promedio, imagen_url, estado)
       VALUES (:sku, :nombre, :descripcion, :precio, :categoria, :stock, :puntuacion_promedio, :imagen_url, :estado)
       RETURNING sku`,
      {
        replacements: {
          sku,
          nombre,
          descripcion: descripcion || null,
          precio,
          categoria: categoria || null,
          stock: 0,
          puntuacion_promedio: null,
          imagen_url: imgPath || null,
          estado: activo ? "activo" : "inactivo"
        },
      }
    );

    const savedSku = result && result[0] && result[0].sku ? result[0].sku : sku;

    if (savedSku && Array.isArray(variantes)) {
      try {
        await sequelize.query(`DELETE FROM variante WHERE sku_producto = :sku`, { replacements: { sku: savedSku } });
        for (const v of variantes) {
          const personas = v.personas ?? v.porciones ?? null;
          const precioVar = toNumber(v.precio, 0);
          await sequelize.query(
            `INSERT INTO variante (sku_producto, porciones, precio)
             VALUES (:sku, :porciones, :precio)`,
            {
              replacements: {
                sku: savedSku,
                porciones: personas,
                precio: precioVar
              }
            }
          );
        }
      } catch (err) {
        if (err && err.original && err.original.code === "42P01") {
          console.warn("Tabla 'variante' no existe — omitiendo manejo de variantes:", err.message);
        } else {
          throw err;
        }
      }
    }

    return res.status(201).json({ ok: true, message: "Producto creado con éxito", sku: savedSku });
  } catch (error) {
    console.error("Error crearProducto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Actualizar producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { sku } = req.params;
    const { nombre, categoria, precioMin, precioMax, imagen, imagen_url, descripcion, variantes, activo } = req.body;

    // Calcular precio principal
    let precio = null;
    const min = toNumber(precioMin);
    const max = toNumber(precioMax);
    if (min != null && max != null) {
      precio = (min + max) / 2;
    } else if (Array.isArray(variantes) && variantes.length > 0 && toNumber(variantes[0].precio) != null) {
      precio = toNumber(variantes[0].precio, 0);
    } else if (min != null) {
      precio = min;
    } else if (max != null) {
      precio = max;
    } else {
      precio = 0;
    }

    const img = (imagen_url || imagen || "").trim();

    let imgPath = img;
    if (imgPath && imgPath.startsWith("data:")) {
      try {
        imgPath = await saveDataUriToFile(imgPath, sku);
      } catch (err) {
        return res.status(400).json({ ok: false, message: "Imagen inválida o no se pudo procesar" });
      }
    }

    await sequelize.query(
      `UPDATE producto
       SET nombre = :nombre,
           descripcion = :descripcion,
           precio = :precio,
           categoria = :categoria,
           imagen_url = :imagen_url,
           estado = :estado
       WHERE sku = :sku`,
      {
        replacements: {
          nombre,
          descripcion: descripcion || null,
          precio,
          categoria,
          imagen_url: imgPath || null,
          estado: activo ? "activo" : "inactivo",
          sku,
        },
      }
    );

    try {
      await sequelize.query(`DELETE FROM variante WHERE sku_producto = :sku`, { replacements: { sku } });
      if (Array.isArray(variantes)) {
        for (const v of variantes) {
          const personas = v.personas ?? v.porciones ?? null;
          const precioVar = toNumber(v.precio, 0);
          await sequelize.query(
            `INSERT INTO variante (sku_producto, porciones, precio)
             VALUES (:sku, :porciones, :precio)`,
            {
              replacements: { sku, porciones: personas, precio: precioVar },
            }
          );
        }
      }
    } catch (err) {
      if (err && err.original && err.original.code === "42P01") {
        console.warn("Tabla 'variante' no existe — omitiendo manejo de variantes en update:", err.message);
      } else {
        throw err;
      }
    }

    return res.json({ ok: true, message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizarProducto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Eliminar producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { sku } = req.params;
    await sequelize.query(`DELETE FROM variante WHERE sku_producto = :sku`, {
      replacements: { sku },
    });
    await sequelize.query(`DELETE FROM producto WHERE sku = :sku`, {
      replacements: { sku },
    });
    return res.json({ ok: true, message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminarProducto:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// ✅ NUEVA FUNCIÓN: Obtener producto por SKU con variantes (para frontend)
exports.obtenerProductoPorSku = async (req, res) => {
  const { sku } = req.params;
  try {
    const [rows] = await sequelize.query(
      "SELECT * FROM producto WHERE sku = :sku",
      { replacements: { sku } }
    );
    if (!rows.length)
      return res.status(404).json({ message: "Producto no encontrado" });

    const producto = rows[0];

    // Intentar obtener las variantes (si existen)
    try {
      const [variantes] = await sequelize.query(
        `
        SELECT 
          porciones AS personas,
          precio
        FROM variante
        WHERE sku_producto = :sku
        ORDER BY porciones ASC
        `,
        { replacements: { sku } }
      );
      producto.variantes = variantes || [];
    } catch (err) {
      console.warn("⚠️ Tabla 'variante' no existe o error al consultar:", err.message);
      producto.variantes = [];
    }

    res.json(producto);
  } catch (err) {
    console.error("❌ Error obtenerProductoPorSku:", err);
    res.status(500).json({ message: "Error al obtener producto." });
  }
};