import { ethers, hardhatArguments } from "hardhat"
import { initConfig, setConfig, updateConfig } from "../utils/config"

const main = async () => {
    try {
        await initConfig()
        const network = hardhatArguments.network ?? "dev"
        const [deployedAddress] = await ethers.getSigners()
        console.log("deploy by address", deployedAddress.address)

        // // Deploy Dads token
        // const Dads = await ethers.getContractFactory("Dads")
        // const dads = await Dads.deploy()
        // await dads.deployed()
        // console.log(`contract deployed`, dads.address)
        // setConfig(`${network}.Dads`, dads.address)

        // // Deploy Vault token
        // const Vault = await ethers.getContractFactory("Vault")
        // const vault = await Vault.deploy()
        // await vault.deployed()
        // console.log(`contract deployed`, vault.address)
        // setConfig(`${network}.Vault`, vault.address)

        // Deploy USDT token
        const USDT = await ethers.getContractFactory("USDT")
        const usdt = await USDT.deploy()
        const u = await usdt.deployed()
        console.log(u)
        console.log(`contract deployed`, usdt.address)
        setConfig(`${network}.USDT`, usdt.address)

        await updateConfig()

        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}
main()
