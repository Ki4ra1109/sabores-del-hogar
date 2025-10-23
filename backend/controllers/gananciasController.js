const { fn, col, literal, Op } = require("sequelize");
const Ganancia = require("../models/Ganancia");

const obtenerGanancias = async (req, res) => {
    try {
        const { period } = req.query;

        const where = { estado_pago: "pagado" };
        let groupBy = "";

        if (period === "day") {
            groupBy = literal(`TO_CHAR(fecha_pago, 'DD Mon')`);
            where.fecha_pago = { [Op.gte]: literal(`NOW() - INTERVAL '7 days'`) };
        } else if (period === "week") {
            groupBy = literal(`TO_CHAR(fecha_pago, 'IYYY-IW')`);
            where.fecha_pago = { [Op.gte]: literal(`NOW() - INTERVAL '28 days'`) };
        } else if (period === "month") {
            groupBy = literal(`TO_CHAR(fecha_pago, 'Mon YYYY')`);
            where.fecha_pago = { [Op.gte]: literal(`NOW() - INTERVAL '6 months'`) };
        }

        const resultados = await Ganancia.findAll({
            where,
            attributes: [
                [groupBy, "label"],
                [fn("SUM", col("monto")), "total"],
            ],
            group: [groupBy],
            order: [[fn("MIN", col("fecha_pago")), "ASC"]],
        });

        res.json(resultados);
    } catch (error) {
        console.error("Error al obtener ganancias:", error);
        res.status(500).json({ message: "Error al obtener ganancias" });
    }
};

module.exports = { obtenerGanancias };
