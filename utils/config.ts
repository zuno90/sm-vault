import { promises as fs } from "fs"

let config: any

export const initConfig = async () => {
    console.log("init deployment")
    config = JSON.parse((await fs.readFile("./config.json")).toString())
    return config
}

export const getConfig = () => config

export const setConfig = (path: string, value: string) => {
    console.log(config)
    const splitPath = path.split(".").reverse()

    let ref = config
    while (splitPath.length > 1) {
        let key = splitPath.pop()
        if (!key) return
        if (!ref[key]) ref[key] = {}
        ref = ref[key]
    }

    let key = splitPath.pop()
    if (key) {
        ref[key] = value
    }
}

export const updateConfig = async () => {
    console.log("write", JSON.stringify(config))
    return fs.writeFile("./config.json", JSON.stringify(config, null, 2))
}
