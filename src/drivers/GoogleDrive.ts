import Drive, { DownloadOptions, DriveResult, UploadOptions, DriveError } from "../interfaces/Drive";
import { google } from 'googleapis'
import readline from 'readline'
import { Configuration } from "../interfaces/Configuration";
import { createReadStream, existsSync, fstat, readFileSync, statSync, writeFile, writeFileSync } from "fs";
import { OAuth2Client } from "googleapis-common";
import dateformat from 'dateformat'

export default class GoogleDrive implements Drive {


    async searchFiles(date: Date): Promise<DriveResult[]> {
        return await new Promise(async (res, rej) => {
            const { id } = await this.backupFolder(this.FOLDER_NAME)

            const initialDate = dateformat(date, 'yyyy-mm-dd', true) + 'T00:00:00'
            const lastDate = dateformat(date, 'yyyy-mm-dd', true) + 'T23:59:59'
            console.table({initialDate, lastDate})
            const query = `'${id}' in parents and createdTime > '${initialDate}' and createdTime < '${lastDate}'`
            const auth = await this.loadCredential()
            const drive = google.drive({ version: 'v3', auth })

            drive.files.list({
                q: query,
                fields: 'files(id,createdTime,name, mimeType)'
            }, (err, r) => {
                if(err) rej(err)
                else {
                    if(r?.data.files) {
                        const data: DriveResult[] = r.data.files.map(file => ({
                            createdAt: new Date(file.createdTime || ''),
                            fileName: file.name || '',
                            id: file.id || '',
                            type: file.mimeType || ''
                        }))

                        res(data)
                    }
                    else
                        rej('not files')
                }
            })
        })
    }

    
    SCOPES = ['https://www.googleapis.com/auth/drive']
    TOKEN_PATH = './token.json'
    FOLDER_NAME = 'bd_sogra'
    

    private async createToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
        return await new Promise((res, rej) => {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return console.error('Error retrieving access token', err);
                    if (token) {
                        oAuth2Client.setCredentials(token);
                        writeFile('./token.json', JSON.stringify(token), (err) => {
                            if (err) rej(err)
                            res(oAuth2Client)
                        });
                    }
                    else rej(new DriveError('error retrieving access token'))
                });
            });
        })
    }

    private async backupFolderExists(name: string): Promise<DriveResult[]> {
        return await new Promise( async (success, failed) => {
            const mimeType = 'application/vnd.google-apps.folder'
            const query = `name='${name}' and mimeType='${mimeType}' and trashed=false`
            const auth = await this.loadCredential()
            const drive = google.drive({ version: 'v3', auth })

            drive.files.list({
                q: query,
                fields: 'files(id,createdTime,name)',
            }, (err, res) => {
                if(err) failed(err)
                else {
                    if(res?.data.files) {
                        const result: DriveResult[] = res?.data.files?.map(file => {
                            return {
                                id: file.id ?? '',
                                createdAt: new Date(file.createdTime || ''),
                                fileName: file.name ?? '',
                                type: mimeType
                            }
                        })
    
                        success(result)
                    }
                    else failed('failed in check backup folder exists')
                }
            })

        })
    }

    private async backupFolder(name: string): Promise<DriveResult> {
        return await new Promise( async (success, reject) => {
            const mimeType = 'application/vnd.google-apps.folder'
            const auth = await this.loadCredential()
            const drive = google.drive({ version: 'v3', auth })
            const [folder] = await this.backupFolderExists(name)

            if(!folder) {
                drive.files.create({
                    fields: 'id,createdTime, name',
                    requestBody: {
                        name,
                        mimeType
                    }
                },
                (err, res) => {
                    if(err) reject(err)
                    else {
                        success({
                            createdAt: new Date(res?.data.createdTime ?? ''),
                            fileName: res?.data.name ?? '',
                            id: res?.data.id || '',
                            type: mimeType
                        })
                    }
                })
            }
            else
                success(folder)
        })
    }

    private async loadCredential(): Promise<OAuth2Client> {
        return await new Promise((res, rej) => {
            const path = readFileSync('./credentials.json', 'utf8')
            const { installed } = JSON.parse(path)
            const { client_secret, client_id, redirect_uris } = installed

            const oAuth2Client = new google.auth.OAuth2(
                client_id, client_secret, redirect_uris[0]);

            if (existsSync(this.TOKEN_PATH)) {
                const token = JSON.parse(readFileSync(this.TOKEN_PATH, 'utf8'))
                oAuth2Client.setCredentials(token)
                res(oAuth2Client)
            }

            else {
                res(this.createToken(oAuth2Client))
            }
        })
    }

    async upload({ filePath, type, fileName, progress }: UploadOptions): Promise<DriveResult> {
        return await new Promise( async (res, rej) => {
            const { id, fileName: nameFile } = await this.backupFolder(this.FOLDER_NAME)
            const auth = await this.loadCredential()
            const drive = google.drive({ version: 'v3', auth })
            const file = createReadStream(filePath)
            const fileSize = statSync(filePath).size

            drive.files.create({
                requestBody:
                {
                    name: fileName,
                    parents: [id],

                },
                media: {
                    mimeType: type,
                    body: file
                },
                fields: 'id,name,createdTime,mimeType'

            }, {
                onUploadProgress({ bytesRead }) {
                    if (progress) {
                        const progressValue = (100 * bytesRead) / fileSize
                        progress(Math.floor(progressValue))
                    }
                }
            },(err, result) => {
                if(err) rej(err)
                else {
                    res({
                        createdAt: new Date(result?.data.createdTime ?? ''),
                        fileName: result?.data.name ?? '',
                        id: result?.data.id ?? '',
                        type: result?.data.mimeType ?? ''
                    })
                }
            })
        })
    }


    download(options: DownloadOptions): Promise<DriveResult> {
        throw new Error("Method not implemented.");
    }

}