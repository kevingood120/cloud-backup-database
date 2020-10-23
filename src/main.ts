import Database from "./interfaces/Database";
import Drive, { DriveResult } from "./interfaces/Drive"
import config from './config'
import fs, { readFile } from 'fs'
import path from 'path'
import mime from 'mime-types'
import dateFormat from "dateformat";

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
        try {
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
                
            }
        }
        catch {

        }
        finally {
            
        }
    }

    async searchBackup({ date, drive }: Query): Promise<DriveResult[]> {
        if(drive === 0) 
            return await this.drive.searchFiles(date)
        else {
            return new Promise((res,rej) => {
                
                const files = fs.readdirSync(config.backupPath)
                const filtered = files.filter(file => {
                    const combine = path.join(config.backupPath, file)
                    const stat = fs.statSync(combine)
                    console.log({
                        start: new Date(stat.birthtime.toLocaleDateString()),
                        final: date
                    })
                    return new Date(stat.birthtime.toLocaleDateString()).toDateString() === date.toDateString()
                })
                const result: DriveResult[] = filtered.map((file, index) => {
                    const combine = path.join(config.backupPath, file)
                    const stat = fs.statSync(combine)
                    const mimeType = mime.contentType(combine)
                    return {
                        type: mimeType || '',
                        id: index + '',
                        createdAt: stat.birthtime,
                        fileName: file
                    }
                })

                res(result)
            })
        }
    }
}

export default Main



