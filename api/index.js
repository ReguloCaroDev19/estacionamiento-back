const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const { type } = require('os');

dotenv.config();
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const VehiculoSchema = new mongoose.Schema({
	placa: {
		type: String,
		required: true,
		minLength: 1,
		maxLength: 120,
		unique: true,
	},
	residente: {
		type: String,
		required: true,
		enum: ['Oficial', 'Residente', 'No residente'],
		default: 'Oficial',
	},
	entrada: [{ type: Date }],
	salida: [{ type: Date }],
	cobro: [
		{
			type: Number,
			default: 0,
		},
	],
});

const Vehiculo = mongoose.model('Vehiculo', VehiculoSchema);
const jsonParser = bodyParser.json();
app.get("/", (req, res) => res.send("Express on Vercel"));
// GET todos los vehiculos
app.get('/api/datos', async (req, res) => {
	try {
		const todo = await Vehiculo.find({});
		const todoMap = todo.map(toDo => toDo);

		res.statusMessage = 'Acceso a datos correcto';
		res.status(200).send(todoMap);
	} catch (error) {
		console.log(error);
		res.statusMessage = 'No hay acceso al servidor';
		res.status(500).send(error);
	}
});
// POST ingresa vehiculos por json
app.post('/api/datos', bodyParser.json(), async (req, res) => {
	const { placa, residente } = req.body;

	const item = new Vehiculo({
		placa,
		residente,
	});

	try {
		await item.save();
		res.statusMessage = 'Se ingreso el vehiculo correctamente';
		res.status(200).send({ message: 'Se ingreso el vehiculo correctamente' });
	} catch (err) {
		console.log(err);
		res.statusMessage = 'No se ingreso el vehiculo';
		res.status(500).send(err);
	}
});
//DELETE elimina por id
app.delete('/api/datos/:id', (req, res) => {
	Vehiculo.findByIdAndDelete(req.params.id)
		.then((todo) => {
			if (!todo) {
				return res.status(404).send();
			}
			res.statusMessage = 'Se dio salida correctamente';
			res.status(200).send(todo);
		})
		.catch((error) => {
			res.statusMessage = 'No se elimino el vehiculo';
			res.status(500).send(error);
		});
});
//PATCH update por id
app.patch('/api/datos/:id', jsonParser, async (req, res) => {
	const { entrada, salida, cobro } = req.body;
	try {
		const todo = await Vehiculo.findByIdAndUpdate(req.params.id, {
			$push: { entrada: entrada, salida: salida, cobro: cobro }
		}, { new: true });

		if (!todo) {
			return res.status(404).send();
		}

		console.log(todo);
		res.statusMessage = 'Se actualizó correctamente';
		res.status(200).send(todo);
	} catch (error) {
		console.log(error);
		res.statusMessage = 'Internal Server Error';
		res.status(500).send(error);
	}
});
//conexion a la base de datos
async function connectDB() {
	try {
		await mongoose.connect(process.env.DB_CONNECT, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('Connected to db!');
		app.listen(3000, () => console.log('Server Up and running'));
	} catch (error) {
		console.error('Error connecting to the database', error);
		process.exit(1); // Salir con un código de error
	}
}
connectDB();