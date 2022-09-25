import dotenv from 'dotenv'
dotenv.config()
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
    solidity: '0.8.9',
    networks: {
        'bsc-testnet': {
            url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
            accounts: [`${process.env.PRIVATE_KEY}`],
        },
    },
    etherscan: {
        apiKey: {
            'bsc-testnet': 'JR7P34748PF93ISQMCC56W7TYY9CX18A6M',
        },
        customChains: [
            {
                network: 'bsc-testnet',
                chainId: 97,
                urls: {
                    apiURL: 'https://api-testnet.bscscan.com/api',
                    browserURL: 'https://api-testnet.bscscan.com',
                },
            },
        ],
    },
}

export default config
