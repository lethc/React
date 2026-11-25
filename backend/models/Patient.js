import mongoose from 'mongoose'

const patientSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    edad: { type: Number, required: true, min: 0 },
    especialidad: { type: String, required: true, trim: true }
}, { timestamps: true })

export default mongoose.model('Patient', patientSchema, 'pacientes')
