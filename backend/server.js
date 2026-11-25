import express from 'express'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'
import patientsRouter from './routes/patients.js'

const host = '127.0.0.1'
const port = 3001
// Mantiene la colección que ya usa el formulario, con opción de cambiar la conexión.
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydb02'

const app = express()
app.use(express.json({ limit: '32kb' }))
app.use('/api/pacientes', patientsRouter)

// Después de compilar React, Express también puede servir la aplicación completa.
app.use(express.static(fileURLToPath(new URL('../dist/', import.meta.url))))

try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    const server = app.listen(port, host, () => {
        console.log(`Backend de pacientes en http://${host}:${port}`)
    })
    server.on('error', async (error) => {
        console.error(`No se pudo iniciar el backend: ${error.code || error.name}`)
        await mongoose.disconnect()
        process.exitCode = 1
    })
} catch (error) {
    console.error(`No se pudo conectar a MongoDB: ${error.name}. Revisa el servicio y MONGODB_URI.`)
    process.exitCode = 1
}
