import Database, 
{ 
    BackupOptions, 
    BackupResult, 
    Connection, 
    DatabaseError, 
    RestoreOptions, 
    RestoreResult 

} from "../interfaces/Database";
import { exec } from "child_process";
import path, { resolve } from 'path'
import dateFormat from 'dateformat'
import { Configuration } from "../interfaces/Configuration";
import mime from 'mime-types'
import fs, { existsSync } from 'fs'

export default class MySqlDatabase implements Database {
    constructor(private readonly configuration: Configuration) { }

    mysqlDumpBuilder(path: string, mode: 'import' | 'export') {
        const { port, user, password, host, database } = this.configuration.connection
        let mysqlDump = 'mysqldump.exe '
        const dumpParameters: any = {    
            '--user': user,
            '--password': password,
            '--databases': database,
            '--verbose': true,
            '--triggers': true,
            '--routines': true,
            '--events': true
        }

        for(let key in dumpParameters) {

            const parameterWithValue = () => {
                const value = dumpParameters[key]
                if(value) {
                    if(key === '--databases')
                        return mode === 'export' ? `${key} ${value}` : ''
                    else if(typeof value === 'boolean')
                        return key
                    else
                        return `${key}=${value}`
                }
                else {
                    return ''
                }
            }

            mysqlDump = `${mysqlDump}${parameterWithValue()} `
        }

        console.log(mysqlDump)

        mysqlDump = `${mysqlDump.trim()} ${database} ${mode === 'import' ? '<' : '>'} ${path}`

        return mysqlDump
    }

    async backup(options: BackupOptions): Promise<BackupResult> {
        
        return new Promise((resolve, reject) => {
            const fileName = `${dateFormat(new Date(), 'yyyy-mm-dd_HH-MM-ss-l', true)}.sql`
            const combinePath = path.join(this.configuration.backupPath,fileName)
            const command = this.mysqlDumpBuilder(combinePath, 'export')

            exec(command, (err, stdout, stderr) => {
                if(err) reject(err)
                else {
                    resolve({
                        fileName: fileName,
                        filePath: combinePath,
                        size: fs.statSync(combinePath).size,
                        type: String(mime.contentType(fileName))
                    })
                }
            })
        })
    }

    async restore({ filePath }: RestoreOptions): Promise<RestoreResult> {
        return new Promise((resolve, reject) => {
            if(!existsSync(filePath)) reject(new DatabaseError(`path ${filePath} not exists`))
            const command = this.mysqlDumpBuilder(filePath, 'import')
            console.log(filePath, command)
            exec(command, (err, stdout, stderr) => {
                if(err) reject(err)
                else {
                    console.log(stdout, stderr)
                    resolve()
                }
            })
        })
    }

}

