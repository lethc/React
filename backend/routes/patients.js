import express from 'express'
import mongoose from 'mongoose'
import Patient from '../models/Patient.js'

const router = express.Router()

const presentarPaciente = ({ _id, nombre, edad, especialidad }) => ({
    id: _id.toString(), nombre, edad, especialidad
})

router.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'MongoDB no está disponible. Intenta de nuevo.' })
    }
    next()
})

router.param('id', (req, res, next, id) => {
    if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({ error: 'El ID del paciente no es válido.' })
    }
    next()
})

// Valida los tres campos antes de guardar y solo acepta estos datos del formulario.
function validarPaciente(req, res, next) {
    const { nombre, edad, especialidad } = req.body || {}
    if (typeof nombre !== 'string' || !nombre.trim() ||
        !Number.isFinite(edad) || edad < 0 ||
        typeof especialidad !== 'string' || !especialidad.trim()) {
        return res.status(400).json({ error: 'Ingresa un nombre, una edad mayor o igual a cero y una especialidad.' })
    }
    req.paciente = { nombre: nombre.trim(), edad, especialidad: especialidad.trim() }
    next()
}

router.get('/', async (req, res) => {
    const pacientes = await Patient.find().sort({ createdAt: 1, _id: 1 })
    res.json(pacientes.map(presentarPaciente))
})

router.post('/', validarPaciente, async (req, res) => {
    const paciente = await Patient.create(req.paciente)
    res.status(201).json(presentarPaciente(paciente))
})

router.put('/:id', validarPaciente, async (req, res) => {
    const paciente = await Patient.findByIdAndUpdate(req.params.id, req.paciente, {
        returnDocument: 'after', runValidators: true
    })
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado.' })
    res.json(presentarPaciente(paciente))
})

router.delete('/:id', async (req, res) => {
    const paciente = await Patient.findByIdAndDelete(req.params.id)
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado.' })
    res.sendStatus(204)
})

router.use((error, req, res, next) => {
    if (res.headersSent) return next(error)
    console.error('Error al consultar o guardar pacientes:', error.message)
    res.status(500).json({ error: 'No se pudo completar la operación con MongoDB.' })
})

export default router
