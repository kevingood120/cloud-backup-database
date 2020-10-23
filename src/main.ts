import Database from "./interfaces/Database";
import Drive from "./interfaces/Drive"
import config from './config'
import fs, { readFile } from 'fs'
import path from 'path'

type ProgressOptions = {
    progress: (progress: number) => void
    step: (step: string) => void
}

type Query = {
    date: Date,
    drive: number
}

class Main {
    database: Database
    drive: Drive
    constructor(database: Database, drive: Drive) {
        this.database = database
        this.drive = drive
        if(!fs.existsSync(config.backupPath))
            fs.mkdirSync(config.backupPath)
    }

    async createBackup({ progress, step }: ProgressOptions) {
        step('Iniciando processo de Backup')
        progress(0)
        const { fileName, type, filePath } = await this.database.backup({})
        step('Processo de backup finalizado')
        progress(100)
        progress(0)
        step('Iniciando Processo de upload para a nuvem')
        return await this.drive.upload({ filePath, fileName, type, progress(value) {
            progress(value)
            if(value === 100) 
                step('Processo de upload finalizado')
            
        }})
    }

    async createRestore({ step, progress, id, fileName }: ProgressOptions & { id: string, fileName: string }) {
        const filePath = path.join(config.backupPath, fileName)
        if(fs.existsSync(filePath)) {
            progress(0)
            step('Arquivo encontrado, processo de restauração iniciado')
            await this.database.restore({
                filePath
            })
            progress(100)
            step('Processo de restauração concluído com êxito')
        }
        else {
            console.log('nuvem')
        }
    }

    async searchBackup({ date, drive }: Query) {
        console.log(date)
        if(drive === 0) 
            return await this.drive.searchFiles(date)
    }
}

export default Main



