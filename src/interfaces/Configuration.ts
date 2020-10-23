import { Connection } from "./Database";

export type Configuration = {
    connection: Connection
    backupPath: string
}