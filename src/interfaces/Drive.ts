export interface UploadOptions {
    progress?: (progress: number) => void
    fileName?: string
    filePath: string
    type: string
}

export interface DownloadOptions {
    progress?: (progress: number) => void
    filename?: string
    destination: string
}

export class DriveError extends Error {
    constructor(msg: string) {
        super(msg)
    } 
}

export interface DriveResult {
    id: string
    fileName: string
    createdAt: Date
    type: string
}

export default interface Drive {
    upload(options: UploadOptions): Promise<DriveResult>
    download(options:  DownloadOptions): Promise<DriveResult>
    searchFiles(date: Date): Promise<DriveResult[]>
}