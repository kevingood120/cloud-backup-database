import express from 'express'
import socketio from 'socket.io'
import http from 'http'
import path from 'path'
import MySqlDatabase from "./databases/MySqlDatabase";
import GoogleDrive from "./drivers/GoogleDrive";
import Main from './main'
import config from './config'

async function bootstrap() {
    const PORT = 7654
    const app = express()
    const server = http.createServer(app)
    const io = socketio(server)
    const main = new Main(new MySqlDatabase(config), new GoogleDrive())
    app.use(express.static(path.resolve('./')  + '/public'));

    app.get('/', (req, res) => {
        return res.sendFile('index.html')
    })

    app.get('/actions/backup', async (req,res) => {
        try {
            await main.createBackup({
                progress(progress) {
                    io.emit('progress', progress)
                },
                step(step) {
                    io.emit('step', step)
                }
            })
            return await res.status(200).send()
        }
        catch(err) {
            io.emit('step', err)
            return await res.status(404).send()
        }
    })

    app.get('/actions/restore/search', async (req,res) => {
        const { date, drive } = req.query

        if(!date || !drive) {
            return await res.status(400).send({message: 'params date and drive not found'})
        }
        else {
            return await res.send(await main.searchBackup({
                date: new Date(date.toString()),
                drive: Number(drive)
            }))
        }
    })

    app.get('/actions/restore/:id/:fileName', async (req, res) => {
        const { id, fileName } = req.params
        if(!id || !fileName) return await res.status(400).send({message: 'params id and filename not found'})
        else {
            await main.createRestore({
                progress(progress) {
                    io.emit('progress', progress)
                },
                step(step) {
                    io.emit('step', step)
                },
                id,
                fileName
            })
            return res.status(200).send({id, fileName})
        }
        
    })

    server.listen(PORT, () => {
        console.clear()
        console.log(`server has been started in port ${PORT}`)
    })
}


bootstrap()