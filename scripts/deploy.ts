import { ethers, hardhatArguments } from "hardhat"
import { initConfig, setConfig, updateConfig } from "../utils/config"

const latestTime = async () => {
    const block = await ethers.provider.getBlock("latest")
    return block.timestamp
}

const duration = {
    seconds(val: number) {
        return val
    },
    minutes(val: number) {
        return val * this.seconds(60)
    },
    hours(val: number) {
        return val * this.minutes(60)
    },
    days(val: number) {
        return val * this.hours(24)
    },
    weeks(val: number) {
        return val * this.days(7)
    },
    years(val: number) {
        return val * this.days(365)
    },
}

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
        // console.log("owner la", await dads.owner())
        // console.log(`contract deployed`, dads.address)
        // setConfig(`${network}.Dads`, dads.address)

        // // Deploy Vault token
        // const Vault = await ethers.getContractFactory("Vault")
        // const vault = await Vault.deploy()
        // await vault.deployed()
        // console.log(`contract deployed`, vault.address)
        // setConfig(`${network}.Vault`, vault.address)

        // Deploy USDT token
        // const USDT = await ethers.getContractFactory("USDT")
        // const usdt = await USDT.deploy()
        // const u = await usdt.deployed()

        // console.log(`contract deployed`, usdt.address)
        // setConfig(`${network}.USDT`, usdt.address)

        const rate = 500 // 500 wei per token
        const OWNER_ADDRESS = process.env.OWNER_ADDRESS as string // vi dev
        const DADS_CONTRACT = "0xfa461B9C50c344142b768215756b467543A26f49" // Dads contract
        const latestBlockTime = await latestTime()
        const openingTime = latestBlockTime + duration.minutes(1)
        const closeTime = openingTime + duration.weeks(8) // 1 week
        console.log("openingTime", openingTime)
        console.log("closeTime", closeTime)

        // deploy contract
        const DadsCS = await ethers.getContractFactory("DadsCS")
        const dadsCS = await DadsCS.deploy(rate, OWNER_ADDRESS, DADS_CONTRACT, OWNER_ADDRESS, openingTime, closeTime)

        await dadsCS.deployed()
        console.log("DadsCS deployed to addess:", dadsCS.address)

        // approve crowdsale contract to spend 70% tokens
        // await itManToken.approve(dadsCS.address, totalSupply.mul(ethers.BigNumber.from(70)).div(ethers.BigNumber.from(100)))
        setConfig(`${network}.DadsCS`, dadsCS.address)
        await updateConfig()

        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

main()
