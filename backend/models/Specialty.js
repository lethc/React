import mongoose from 'mongoose'

const especialidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true, unique: true }
})

const Specialty = mongoose.model('Specialty', especialidadSchema, 'especialidades')

const nombresIniciales = [
    'Alergología',
    'Anestesiología',
    'Cardiología',
    'Cirugía general',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Geriatría',
    'Ginecología y obstetricia',
    'Hematología',
    'Infectología',
    'Medicina de emergencias',
    'Medicina familiar',
    'Medicina física y rehabilitación',
    'Medicina interna',
    'Nefrología',
    'Neumología',
    'Neurología',
    'Oftalmología',
    'Oncología',
    'Otorrinolaringología',
    'Pediatría',
    'Psiquiatría',
    'Radiología',
    'Reumatología',
    'Traumatología y ortopedia',
    'Urología'
]

export async function inicializarEspecialidades() {
    // Inserta los nombres iniciales una sola vez y conserva las entradas agregadas.
    await Specialty.init()
    await Specialty.bulkWrite(nombresIniciales.map((nombre) => ({
        updateOne: {
            filter: { nombre },
            update: { $setOnInsert: { nombre } },
            upsert: true
        }
    })))
}

export default Specialty
