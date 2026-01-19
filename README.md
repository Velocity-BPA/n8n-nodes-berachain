# n8n-nodes-berachain

**Comprehensive Berachain Proof of Liquidity blockchain integration for n8n**

[![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)
[![n8n Community Node](https://img.shields.io/badge/n8n-community%20node-orange)](https://n8n.io)

## License Notice

This software is licensed under the **Business Source License 1.1 (BSL 1.1)**.

- **Free for non-commercial use**
- **Commercial use requires a license from Velocity BPA**
- **Converts to Apache 2.0 on January 1, 2028**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

**For commercial licensing inquiries, contact Velocity BPA.**

---

## Overview

This n8n community node provides deep integration with the **Berachain** blockchain ecosystem, including its unique **Proof of Liquidity (PoL)** consensus mechanism. It supports all major Berachain protocols:

- **BGT** - Bera Governance Token (non-transferable, earned through PoL)
- **HONEY** - Overcollateralized stablecoin
- **BEX** - Native decentralized exchange
- **Bend** - Lending protocol
- **Berps** - Perpetuals trading
- **Infrared** - Liquid staking (iBGT)
- **Reward Vaults** - LP staking for BGT rewards
- **Validators & Gauges** - BGT emission governance

## Installation

### Via n8n Community Nodes

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install**
4. Enter `n8n-nodes-berachain`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or copy the package
npm install n8n-nodes-berachain
```

### Development Installation

```bash
git clone https://github.com/velocitybpa/n8n-nodes-berachain.git
cd n8n-nodes-berachain
npm install
npm run build
npm link

# In your n8n directory
npm link n8n-nodes-berachain
```

## Configuration

### Credentials

#### Berachain Network (Required)

Configure your connection to Berachain:

| Field | Description |
|-------|-------------|
| Network | Select `Mainnet`, `Bartio Testnet`, or `Custom` |
| Custom RPC URL | Your RPC endpoint (for custom network) |
| WebSocket URL | Optional WebSocket for real-time events |
| Private Key | Optional, required for write operations |
| Beratrail API Key | Optional, for enhanced data access |

#### Berachain API (Optional)

For subgraph and advanced analytics:

| Field | Description |
|-------|-------------|
| Environment | Mainnet or Testnet |
| Subgraph API Key | For querying Berachain subgraphs |
| Custom Subgraph URL | Override default subgraph endpoints |

## Nodes

### Berachain Node

The main node with 23 resource categories and 130+ operations.

### Berachain Trigger

Real-time event triggers for blockchain events.

## Resources & Operations

### Account
- `getBalance` - Get native BERA balance
- `getTokenBalances` - Get all token balances
- `getTransactionCount` - Get nonce
- `getAccountInfo` - Comprehensive account data
- `getBgtBalance` - Get BGT balance and details
- `getBoosts` - Get active BGT boosts
- `estimateGas` - Estimate gas for transaction

### Transaction
- `sendBera` - Send native BERA
- `sendTransaction` - Send custom transaction
- `getTransaction` - Get transaction by hash
- `getReceipt` - Get transaction receipt
- `waitForTransaction` - Wait for confirmation
- `getGasPrice` - Get current gas price
- `getFeeData` - Get comprehensive fee data

### BERA
- `getBalance` - Get BERA balance
- `transfer` - Transfer BERA
- `wrap` - Wrap BERA to WBERA
- `unwrap` - Unwrap WBERA to BERA
- `getWberaBalance` - Get WBERA balance

### BGT (Bera Governance Token)
- `getBalance` - Get BGT balance
- `getBalances` - Get detailed BGT info
- `getBoosts` - Get boost information
- `queueBoost` - Queue BGT for boosting
- `activateBoost` - Activate queued boost
- `cancelBoost` - Cancel queued boost
- `dropBoost` - Drop active boost
- `delegate` - Delegate voting power
- `getDelegate` - Get current delegate
- `getVotes` - Get voting power

### HONEY (Stablecoin)
- `getBalance` - Get HONEY balance
- `getStats` - Get HONEY protocol stats
- `getMintRate` - Get current mint rate
- `getRedeemRate` - Get current redeem rate
- `previewMint` - Preview mint output
- `previewRedeem` - Preview redeem output
- `mint` - Mint HONEY with collateral
- `redeem` - Redeem HONEY for collateral
- `getCollateralBasket` - Get supported collaterals

### Validator
- `getActiveValidators` - List active validators
- `getValidatorInfo` - Get validator details
- `getCuttingBoard` - Get validator's cutting board
- `getValidatorWeight` - Get validator BGT weight
- `getBgtPerBlock` - Get BGT emission rate

### Reward Vault
- `getVaults` - List reward vaults
- `getVaultInfo` - Get vault details
- `stake` - Stake tokens in vault
- `unstake` - Unstake tokens from vault
- `getStake` - Get staked balance
- `claimRewards` - Claim BGT rewards
- `getEarned` - Get pending rewards
- `getApy` - Get vault APY

### Cutting Board
- `getConfig` - Get cutting board config
- `getDistribution` - Get reward distribution
- `getWeights` - Get vault weights

### Gauge
- `getGauges` - List all gauges
- `getGaugeInfo` - Get gauge details
- `getWeight` - Get gauge weight
- `getVotingConfig` - Get voting configuration

### BEX (DEX)
- `getPools` - List liquidity pools
- `getPoolInfo` - Get pool details
- `getQuote` - Get swap quote
- `swap` - Execute swap
- `addLiquidity` - Add liquidity to pool
- `removeLiquidity` - Remove liquidity
- `getLpBalance` - Get LP token balance
- `getReserves` - Get pool reserves

### Bend (Lending)
- `getMarkets` - List lending markets
- `getMarketInfo` - Get market details
- `getUserPosition` - Get user's position
- `supply` - Supply assets
- `withdraw` - Withdraw assets
- `borrow` - Borrow assets
- `repay` - Repay borrowed assets
- `getHealthFactor` - Get health factor

### Berps (Perpetuals)
- `getMarkets` - List perpetual markets
- `getMarketInfo` - Get market details
- `getPositions` - Get open positions
- `openPosition` - Open new position
- `closePosition` - Close position
- `addMargin` - Add margin to position
- `removeMargin` - Remove margin
- `getFundingRate` - Get funding rate
- `getVaultInfo` - Get Berps vault info
- `depositToVault` - Deposit to vault
- `withdrawFromVault` - Withdraw from vault

### Contract
- `call` - Call view function
- `execute` - Execute state-changing function
- `getCode` - Get contract bytecode
- `isContract` - Check if address is contract

### Token
- `getInfo` - Get ERC20 token info
- `getBalance` - Get token balance
- `transfer` - Transfer tokens
- `approve` - Approve spender
- `getAllowance` - Get allowance

### NFT
- `getOwner` - Get NFT owner (ERC721)
- `getBalance` - Get NFT balance (ERC721)
- `getTokenUri` - Get token URI
- `transfer` - Transfer NFT
- `getBalance1155` - Get balance (ERC1155)

### Block
- `getLatestBlock` - Get latest block
- `getBlockByNumber` - Get block by number
- `getBlockNumber` - Get current block number
- `getBlockWithTx` - Get block with transactions

### Event
- `getLogs` - Get raw event logs
- `getContractLogs` - Get decoded contract logs

### Governance
- `getVotingPower` - Get voting power
- `getPastVotes` - Get historical votes
- `getDelegate` - Get delegate address
- `delegate` - Delegate voting power

### Infrared (Liquid Staking)
- `getIbgtBalance` - Get iBGT balance
- `getIbgtPrice` - Get iBGT/BGT rate
- `stakeBgt` - Stake BGT for iBGT
- `unstakeIbgt` - Unstake iBGT for BGT
- `getPendingRewards` - Get pending rewards
- `claimRewards` - Claim rewards

### Multicall
- `executeMulticall` - Execute multiple calls
- `aggregate` - Batch view calls

### Analytics
- `getNetworkStats` - Get network statistics
- `getGasStats` - Get gas statistics
- `getPolStats` - Get PoL statistics
- `getValidatorStats` - Get validator stats

### Subgraph
- `querySubgraph` - Execute GraphQL query
- `getStatus` - Get subgraph status

### Utility
- `validateAddress` - Validate address
- `checksumAddress` - Get checksum address
- `convertUnits` - Convert units (wei/ether)
- `hashData` - Hash data (keccak256)
- `getChainId` - Get chain ID
- `testConnection` - Test RPC connection

## Trigger Events

The Berachain Trigger node supports:

- **New Block** - Trigger on each new block
- **Pending Transaction** - Trigger on pending tx
- **BGT Queued** - BGT boost queued
- **BGT Activated** - BGT boost activated
- **BGT Dropped** - BGT boost dropped
- **BGT Delegated** - BGT delegation changed
- **HONEY Minted** - HONEY minted
- **HONEY Redeemed** - HONEY redeemed
- **Reward Vault Staked** - Tokens staked in vault
- **Reward Vault Withdrawn** - Tokens withdrawn
- **Rewards Claimed** - BGT rewards claimed
- **BEX Swap** - DEX swap executed
- **Bend Supply** - Assets supplied to Bend
- **Bend Borrow** - Assets borrowed from Bend
- **Berps Position Opened** - Perp position opened
- **Berps Position Closed** - Perp position closed
- **Custom Contract Event** - Any contract event

## Example Workflows

### Monitor BGT Rewards

```json
{
  "nodes": [
    {
      "name": "Berachain Trigger",
      "type": "n8n-nodes-berachain.berachainTrigger",
      "parameters": {
        "event": "rewardsClaimed",
        "vaultAddress": "0x..."
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#defi-alerts",
        "text": "BGT rewards claimed: {{$json.args.amount}}"
      }
    }
  ]
}
```

### Auto-Compound BGT

```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.schedule",
      "parameters": {
        "rule": { "interval": [{ "hours": 24 }] }
      }
    },
    {
      "name": "Check Rewards",
      "type": "n8n-nodes-berachain.berachain",
      "parameters": {
        "resource": "rewardVault",
        "operation": "getEarned"
      }
    },
    {
      "name": "Claim Rewards",
      "type": "n8n-nodes-berachain.berachain",
      "parameters": {
        "resource": "rewardVault",
        "operation": "claimRewards"
      }
    }
  ]
}
```

### Track HONEY Mints

```json
{
  "nodes": [
    {
      "name": "HONEY Trigger",
      "type": "n8n-nodes-berachain.berachainTrigger",
      "parameters": {
        "event": "honeyMinted"
      }
    },
    {
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "operation": "append",
        "sheetId": "...",
        "values": {
          "timestamp": "={{$json.blockNumber}}",
          "amount": "={{$json.args.amount}}"
        }
      }
    }
  ]
}
```

## Berachain Concepts

### Proof of Liquidity (PoL)

Berachain's consensus mechanism where validators earn BGT rewards proportional to liquidity they attract:

1. **Liquidity Providers** stake LP tokens in Reward Vaults
2. **Reward Vaults** distribute BGT to stakers
3. **Validators** configure Cutting Boards to direct BGT to vaults
4. **BGT Holders** boost validators to increase their emissions

### BGT (Bera Governance Token)

- **Non-transferable** - Can only be earned, not bought
- **Earned through** - Providing liquidity and staking in Reward Vaults
- **Use cases** - Boost validators, delegate voting power, burn for BERA

### HONEY

Berachain's native overcollateralized stablecoin:

- Mint with approved collateral (WBERA, WETH, WBTC, etc.)
- Dynamic mint/redeem rates based on market conditions
- Core to Berachain DeFi ecosystem

### Reward Vaults

Smart contracts that distribute BGT to LP token stakers:

- Each vault accepts specific LP tokens
- BGT rewards based on validator cutting board allocation
- Users can stake, unstake, and claim rewards

## Error Handling

All operations return structured error responses:

```json
{
  "success": false,
  "error": {
    "message": "Insufficient balance",
    "code": "INSUFFICIENT_FUNDS",
    "details": { ... }
  }
}
```

## Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| Mainnet | 80094 | ✅ Supported |
| Bartio Testnet | 80084 | ✅ Supported |
| Custom | Any | ✅ Supported |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Test
npm test

# Format
npm run format
```

## Support

- **Issues**: [GitHub Issues](https://github.com/velocitybpa/n8n-nodes-berachain/issues)
- **Documentation**: [Berachain Docs](https://docs.berachain.com)
- **Commercial Support**: Contact Velocity BPA

## Contributing

Contributions are welcome under the BSL 1.1 license terms. Please read our contributing guidelines before submitting PRs.

## Changelog

### v1.0.0

- Initial release
- 23 resource categories
- 130+ operations
- Real-time event triggers
- Full PoL support

---

**Built with ❤️ by Velocity BPA for the Berachain ecosystem**
