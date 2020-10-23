export type BackupResult = {
    fileName: string
    filePath: string
    size: number
    type: string
}

export type RestoreResult = {

}

export type BackupOptions = {
    
}

export type RestoreOptions = {
    filePath: string
}

export type Connection = {
    user: string
    password: string
    database?: string
    host: string
    port?: number
}

export class DatabaseError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

export default interface Database {

    backup(options: BackupOptions): Promise<BackupResult>
    restore(options: RestoreOptions): Promise<RestoreResult>
}

