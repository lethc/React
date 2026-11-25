import express from 'express'
import Specialty from '../models/Specialty.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const registros = await Specialty.find().select('nombre -_id')
            .collation({ locale: 'es' }).sort({ nombre: 1 }).lean()
        res.json(registros.map(({ nombre }) => nombre))
    } catch (error) {
        console.error('Error al consultar el catálogo de especialidades:', error.message)
        res.status(503).json({ error: 'No se pudo cargar el catálogo de especialidades.' })
    }
})

export default router
