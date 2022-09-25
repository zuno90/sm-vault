import { expect } from "chai"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract } from "@ethersproject/contracts"
import { keccak256 } from "ethers/lib/utils"

// helper
const parseEther = (amount: Number) => ethers.utils.parseUnits(amount.toString(), 10)

// address
let owner: SignerWithAddress
let zuno: SignerWithAddress
let onuz: SignerWithAddress
let zonu: SignerWithAddress
// contract
let VaultToken: Contract, DadsToken: Contract

describe("Vault", () => {
    beforeEach(async () => {
        await ethers.provider.send("hardhat_reset", [])
        const [ow, zu, on, zo] = await ethers.getSigners()
        ;(owner = ow), (zuno = zu), (onuz = on), (zonu = zo)

        const Vault = await ethers.getContractFactory("Vault", owner)
        VaultToken = await Vault.deploy()

        const Dads = await ethers.getContractFactory("Dads", owner)
        DadsToken = await Dads.deploy()

        VaultToken.setToken(DadsToken.address) // set Dads for Vault
    })

    // test case HAPPY CASE
    it("Should deposit into Vault", async () => {
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(500 * 10 ** 3))
        expect(await DadsToken.balanceOf(VaultToken.address)).equal(parseEther(500 * 10 ** 3))
    })
    it("Should withdraw", async () => {
        const WITHDRAW_ROLE = keccak256(Buffer.from("WITHDRAW_ROLE")).toString()
        await VaultToken.grantRole(WITHDRAW_ROLE, onuz.address)

        // setter vault functions

        await VaultToken.setWithdrawEnable(true)
        await VaultToken.setMaxWithDrawAmount(parseEther(1 * 10 ** 6))

        // zuno deposit into Vault
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(500 * 10 ** 3))

        // onuz withdraw from Vault of zuno
        await VaultToken.connect(onuz).withdraw(parseEther(300 * 10 ** 3), zuno.address)

        expect(await DadsToken.balanceOf(VaultToken.address)).equal(parseEther(200 * 10 ** 3))
        expect(await DadsToken.balanceOf(zuno.address)).equal(parseEther(800 * 10 ** 3))
    })

    // test case UNHAPPY CASE
    it("Should not deposit, Insufficient account balance", async () => {
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await expect(VaultToken.connect(zuno).deposit(parseEther(2 * 10 ** 6))).revertedWith("Your balance is low")
    })
    it("Shoult not withdraw, User has no withdrawed permission", async () => {
        let WITHDRAW_ROLE = keccak256(Buffer.from("WITHDRAW_ROLE")).toString()
        await VaultToken.grantRole(WITHDRAW_ROLE, onuz.address)

        // setter vault functions

        await VaultToken.setWithdrawEnable(false)
        await VaultToken.setMaxWithDrawAmount(parseEther(1 * 10 ** 6))

        // zuno deposit into Vault
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(500 * 10 ** 3))

        // onuz withdraw from Vault of zuno
        await expect(VaultToken.connect(onuz).withdraw(parseEther(300 * 10 ** 3), zuno.address)).revertedWith("User has no withdrawed permission")
    })
    it("Should not withdraw, Exceed maximum account", async () => {
        let WITHDRAW_ROLE = keccak256(Buffer.from("WITHDRAW_ROLE")).toString()
        await VaultToken.grantRole(WITHDRAW_ROLE, onuz.address)

        // setter vault functions

        await VaultToken.setWithdrawEnable(true)
        await VaultToken.setMaxWithDrawAmount(parseEther(1 * 10 ** 3))

        // zuno deposit into Vault
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(500 * 10 ** 3))

        // onuz withdraw from Vault of zuno
        await expect(VaultToken.connect(onuz).withdraw(parseEther(3 * 10 ** 3), zuno.address)).revertedWith("Exceed maximum account")
    })
    it("Should not withdraw, Caller is not a withdrawer", async () => {
        // grant access withdraw role for onuz
        let WITHDRAW_ROLE = keccak256(Buffer.from("WITHDRAW_ROLE")).toString()
        await VaultToken.grantRole(WITHDRAW_ROLE, onuz.address)

        // setter vault functions

        await VaultToken.setWithdrawEnable(true)
        await VaultToken.setMaxWithDrawAmount(parseEther(1 * 10 ** 3))

        // zuno deposit into Vault
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(500 * 10 ** 3))

        await expect(VaultToken.connect(zonu).withdraw(parseEther(3 * 10 ** 3), zuno.address)).revertedWith("Caller is not a withdrawer")
    })
    it("Should not withdraw, ERC20: transfer amount exceeds balance", async () => {
        // grant access withdraw role for onuz
        let WITHDRAW_ROLE = keccak256(Buffer.from("WITHDRAW_ROLE")).toString()
        await VaultToken.grantRole(WITHDRAW_ROLE, onuz.address)

        // setter vault functions

        await VaultToken.setWithdrawEnable(true)
        await VaultToken.setMaxWithDrawAmount(parseEther(5 * 10 ** 3))

        // zuno deposit into Vault
        await DadsToken.transfer(zuno.address, parseEther(1 * 10 ** 6))
        await DadsToken.connect(zuno).approve(VaultToken.address, DadsToken.balanceOf(zuno.address))
        await VaultToken.connect(zuno).deposit(parseEther(2 * 10 ** 3))

        await expect(VaultToken.connect(onuz).withdraw(parseEther(3 * 10 ** 3), zuno.address)).revertedWith("ERC20: transfer amount exceeds balance")
    })
})
