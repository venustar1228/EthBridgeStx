import SendStore from 'store/SendStore'
import { useRecoilValue } from 'recoil'
import { BlockChainType, BridgeType } from 'types'

// full whitelist
const whitelist: Record<
  BlockChainType,
  Record<string, Record<string, string>>
> = {
  [BlockChainType.stx]: {

  },
  [BlockChainType.avalanche]: {
    [BridgeType.wormhole]: {},
    [BridgeType.axelar]: {
      uluna: '0x120AD3e5A7c796349e591F1570D9f7980F4eA9cb',
    },
  },
  [BlockChainType.bsc]: {
    [BridgeType.wormhole]: {},
  },
  [BlockChainType.cosmos]: {
    [BridgeType.ibc]: {
      uluna:
        'ibc/34CEF8B6A6424C45FE3CCC4A02C9DF9BB38BACC323E08DFFEFE9E4B18BB89AC4',
      'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2':
        'uatom',
    },
  },
  [BlockChainType.ethereum]: {
    [BridgeType.axelar]: {
      'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4':
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      'ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF':
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      //'ibc/05D299885B07905B6886F554B39346EA6761246076A1120B1950049B92B922DD':
      //  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      //'ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674':
      //  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
  },
  [BlockChainType.fantom]: {
    [BridgeType.wormhole]: {},
    [BridgeType.axelar]: {
      uluna: '0x5e3C572A97D898Fe359a2Cea31c7D46ba5386895',
    },
  },
  [BlockChainType.inj]: {
    [BridgeType.ibc]: {},
  },
  [BlockChainType.osmo]: {
    [BridgeType.ibc]: {
      uluna:
        'ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9',
      'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B':
        'uosmo',
    },
  },
  [BlockChainType.scrt]: {
    [BridgeType.ibc]: {
      uluna:
        'ibc/28DECFA7FB7E3AB58DC3B3AEA9B11C6C6B6E46356DCC26505205DAD3379984F5',
      'ibc/10BD6ED30BA132AB96F146D71A23B46B2FC19E7D79F52707DC91F2F3A45040AD':
        'uscrt',
    },
  },
  [BlockChainType.juno]: {
    [BridgeType.ibc]: {
      uluna:
        'ibc/107D152BB3176FAEBF4C2A84C5FFDEEA7C7CB4FE1BBDAB710F1FD25BCD055CBF',
      'ibc/4CD525F166D32B0132C095F353F4C6F033B0FF5C49141470D1EFDA1D63303D04':
        'ujuno',
    },
  },
  [BlockChainType.crescent]: {
    [BridgeType.ibc]: {
      uluna:
        'ibc/177904239844D7D0E59D04F864D1278C07A80688EA67BCFA940E954FFA4CF699',
      'ibc/B090DC21658BD57698522880590CA53947B8B09355764131AA94EC75517D46A5':
        'ucre',
    },
  },
  [BlockChainType.polygon]: {
    [BridgeType.wormhole]: {},
    [BridgeType.axelar]: {},
  },
  [BlockChainType.moonbeam]: {
    [BridgeType.axelar]: {},
  },
  // other chains
  [BlockChainType.axelar]: {},
  [BlockChainType.terra]: {},
}

// return current whitelist
export default function useWhiteList(): Record<string, string> {
  const fromBlockChain = useRecoilValue(SendStore.fromBlockChain)
  const toBlockChain = useRecoilValue(SendStore.toBlockChain)
  const bridgeUsed = useRecoilValue(SendStore.bridgeUsed)

  const chain =
    fromBlockChain === BlockChainType.terra ? toBlockChain : fromBlockChain

  if (!bridgeUsed || chain === BlockChainType.terra) return {}

  return whitelist[chain]?.[bridgeUsed] || {}
}
