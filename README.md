# n8n-nodes-berachain

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for integrating with Berachain blockchain network. This node provides 5 core resources enabling validators monitoring, governance participation, HoneyStablecoin operations, DeFi protocols interaction, and automated blockchain workflows for the Berachain ecosystem.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Berachain](https://img.shields.io/badge/Berachain-Network-orange)
![Web3](https://img.shields.io/badge/Web3-Integration-green)
![DeFi](https://img.shields.io/badge/DeFi-Ready-purple)

## Features

- **Validator Management** - Monitor validator performance, stake amounts, and delegation rewards
- **Governance Integration** - Vote on proposals, create governance submissions, and track voting results
- **HoneyStablecoin Operations** - Mint, burn, transfer, and monitor Honey stablecoin transactions
- **DeFi Protocol Access** - Interact with Berachain's native DeFi protocols and liquidity pools
- **Automated Workflows** - Create sophisticated blockchain automation with conditional logic
- **Real-time Monitoring** - Track network events, transaction confirmations, and block updates
- **Multi-signature Support** - Handle complex wallet operations and multi-sig transactions
- **Gas Optimization** - Intelligent fee estimation and transaction optimization

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-berachain`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-berachain
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-berachain.git
cd n8n-nodes-berachain
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-berachain
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your Berachain API access key for authenticated requests | Yes |
| Network | Berachain network (mainnet, testnet) | Yes |
| Wallet Address | Primary wallet address for operations (optional for read-only) | No |
| Private Key | Wallet private key for transaction signing (encrypted) | No |

## Resources & Operations

### 1. Validators

| Operation | Description |
|-----------|-------------|
| Get Validator | Retrieve detailed information about a specific validator |
| List Validators | Get all validators with filtering and pagination |
| Get Validator Performance | Fetch performance metrics and statistics |
| Get Delegations | Retrieve delegation information for a validator |
| Get Rewards | Get staking rewards and distribution data |
| Delegate Tokens | Delegate tokens to a validator |
| Undelegate Tokens | Remove delegation from a validator |
| Claim Rewards | Claim accumulated staking rewards |

### 2. Governance

| Operation | Description |
|-----------|-------------|
| Get Proposal | Retrieve details of a governance proposal |
| List Proposals | Get all governance proposals with status filtering |
| Create Proposal | Submit a new governance proposal |
| Vote on Proposal | Cast a vote on an active proposal |
| Get Votes | Retrieve voting information for a proposal |
| Get Voting Power | Check voting power for an address |
| Get Proposal Results | Get final voting results and outcome |

### 3. HoneyStablecoin

| Operation | Description |
|-----------|-------------|
| Get Balance | Check HONEY token balance for an address |
| Transfer Tokens | Send HONEY tokens to another address |
| Mint Tokens | Mint new HONEY tokens (if authorized) |
| Burn Tokens | Burn existing HONEY tokens |
| Get Transaction | Retrieve transaction details by hash |
| Get Transaction History | Get transaction history for an address |
| Check Allowance | Check token allowance between addresses |
| Approve Spending | Approve token spending for another address |

### 4. Defi

| Operation | Description |
|-----------|-------------|
| Get Pool Info | Retrieve information about liquidity pools |
| Add Liquidity | Add tokens to a liquidity pool |
| Remove Liquidity | Remove tokens from a liquidity pool |
| Swap Tokens | Execute token swaps through DEX |
| Get Price | Get current token prices and exchange rates |
| Get Pool Rewards | Retrieve liquidity mining rewards |
| Claim Pool Rewards | Claim accumulated DeFi rewards |
| Get Portfolio | Get complete DeFi portfolio overview |

### 5. Automation

| Operation | Description |
|-----------|-------------|
| Create Trigger | Set up blockchain event triggers |
| Monitor Address | Watch address for transaction activity |
| Schedule Transaction | Schedule delayed transaction execution |
| Get Network Status | Check network health and status |
| Estimate Gas | Calculate gas fees for transactions |
| Batch Transactions | Execute multiple transactions in sequence |
| Get Block Info | Retrieve blockchain block information |
| Watch Events | Monitor smart contract events |

## Usage Examples

```javascript
// Monitor validator performance
{
  "validator_address": "beravaloper1abc123...",
  "include_delegations": true,
  "time_period": "7d"
}

// Vote on governance proposal
{
  "proposal_id": "42",
  "vote": "yes",
  "voter_address": "bera1xyz789...",
  "memo": "Supporting network upgrade"
}

// Swap tokens through DeFi
{
  "from_token": "HONEY",
  "to_token": "BERA",
  "amount": "100",
  "slippage_tolerance": "0.5",
  "deadline": 1800
}

// Set up automated staking rewards claim
{
  "trigger_type": "rewards_threshold",
  "threshold_amount": "50",
  "validator_address": "beravaloper1def456...",
  "auto_restake": true
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has proper permissions |
| Insufficient Balance | Wallet doesn't have enough tokens for operation | Check balance and ensure adequate funds |
| Network Congestion | Transaction failed due to network issues | Retry with higher gas fees or wait for network recovery |
| Invalid Address | Provided wallet or contract address is malformed | Validate address format matches Berachain standards |
| Gas Estimation Failed | Unable to estimate transaction gas costs | Check network status and transaction parameters |
| Proposal Not Found | Governance proposal ID doesn't exist | Verify proposal ID and check if proposal is active |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-berachain/issues)
- **Berachain Documentation**: [docs.berachain.com](https://docs.berachain.com)
- **Developer Portal**: [developers.berachain.com](https://developers.berachain.com)