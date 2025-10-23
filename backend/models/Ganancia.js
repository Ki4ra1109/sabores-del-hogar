const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Ganancia = db.define("Ganancia", {
    id_pago: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_pedido: {
        type: DataTypes.INTEGER,
    },
    metodo_pago: {
        type: DataTypes.STRING,
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
    },
    fecha_pago: {
        type: DataTypes.DATE,
    },
    estado_pago: {
        type: DataTypes.STRING,
    },
}, {
    tableName: "pago", //clave: apunta directamente a la tabla 'pago'
    timestamps: false,
});

module.exports = Ganancia;
