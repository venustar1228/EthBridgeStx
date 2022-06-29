import { ReactElement } from 'react'
import styled from 'styled-components'
import { useRecoilState } from 'recoil'
import wormholeGif from 'images/wormhole.gif'
import ibcGif from 'images/ibc.gif'
import shuttleGif from 'images/shuttle.gif'

import { NETWORK } from 'consts'

import { BlockChainType, BridgeType, getDefaultBridge } from 'types/network'

import useAuth from 'hooks/useAuth'

import SendStore from 'store/SendStore'

import SelectBlockChain from '../../components/SelectBlockChain'
import SelectBridge from 'components/SelectBridge'
import useUpdateBridgeType from 'hooks/useUpdateBridgeType'

const StyledNetworkBox = styled.div`
  display: flex;
  padding: 0 40px;

  @media (max-width: 575px) {
    padding: 0;
  }
`

const BackgroundImg = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  background-repeat: no-repeat;
  background-size: 40% 60%;
  background-position: 50% 50%;
`

const BlockChainNetwork = (): ReactElement => {
  const { logout } = useAuth()
  const [toBlockChain, setToBlockChain] = useRecoilState(SendStore.toBlockChain)

  const [fromBlockChain, setFromBlockChain] = useRecoilState(
    SendStore.fromBlockChain
  )
  const [bridgeUsed, setBridgeUsed] = useRecoilState(SendStore.bridgeUsed)
  useUpdateBridgeType()
  const { setBlockchainStorage } = useAuth()

  return (
    <StyledNetworkBox>
      <BackgroundImg
        style={{
          backgroundImage: ((): string => {
            switch (bridgeUsed) {
              case BridgeType.wormhole:
                return `url('${wormholeGif}')`
              case BridgeType.ibc:
              case BridgeType.axelar:
                return `url('${ibcGif}')`
              default:
                return `url('${shuttleGif}')`
            }
          })(),
        }}
      >
        <SelectBlockChain
          {...{
            blockChain: fromBlockChain,
            setBlockChain: (value): void => {
              logout()
              setFromBlockChain(value)
              if (value !== BlockChainType.stx) {
                alert("not stx");
                setToBlockChain(BlockChainType.stx)
              }
              else setToBlockChain(BlockChainType.ethereum)
              setBridgeUsed(getDefaultBridge(BlockChainType.ethereum, BlockChainType.stx))
              setBlockchainStorage({
                fromBlockChain: value,
                toBlockChain: BlockChainType.stx,
                bridgeUsed: getDefaultBridge(value, BlockChainType.stx),
              })
            },
            optionList: [
              {
                label: NETWORK.blockChainName[BlockChainType.stx],
                value: BlockChainType.stx,
                isDisabled: fromBlockChain === BlockChainType.stx,
              },
              {
                label: NETWORK.blockChainName[BlockChainType.ethereum],
                value: BlockChainType.ethereum,
                isDisabled: fromBlockChain === BlockChainType.ethereum,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.osmo],
              //   value: BlockChainType.osmo,
              //   isDisabled: fromBlockChain === BlockChainType.osmo,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.scrt],
              //   value: BlockChainType.scrt,
              //   isDisabled: fromBlockChain === BlockChainType.scrt,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.cosmos],
              //   value: BlockChainType.cosmos,
              //   isDisabled: fromBlockChain === BlockChainType.cosmos,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.juno],
              //   value: BlockChainType.juno,
              //   isDisabled: fromBlockChain === BlockChainType.juno,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.crescent],
              //   value: BlockChainType.crescent,
              //   isDisabled: fromBlockChain === BlockChainType.crescent,
              // },
            ],
            label: 'FROM',
          }}
        />
        <div style={{ height: '100%', display: 'flex', alignItems: 'start' }}>
          <SelectBridge />
        </div>
        <SelectBlockChain
          {...{
            blockChain: toBlockChain,
            setBlockChain: (b): void => {
              setToBlockChain(b)
              if (b !== BlockChainType.stx) {
                setFromBlockChain(BlockChainType.stx)
                logout()
              }
              else setFromBlockChain(BlockChainType.ethereum)
              setBridgeUsed(getDefaultBridge(BlockChainType.stx, b))
              setBlockchainStorage({
                fromBlockChain: BlockChainType.ethereum,
                toBlockChain: BlockChainType.stx,
                bridgeUsed: getDefaultBridge(BlockChainType.stx, b),
              })
            },
            optionList: [
              {
                label: NETWORK.blockChainName[BlockChainType.stx],
                value: BlockChainType.stx,
                isDisabled: toBlockChain === BlockChainType.stx,
              },
              {
                label: NETWORK.blockChainName[BlockChainType.ethereum],
                value: BlockChainType.ethereum,
                isDisabled: toBlockChain === BlockChainType.ethereum,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.osmo],
              //   value: BlockChainType.osmo,
              //   isDisabled: toBlockChain === BlockChainType.osmo,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.scrt],
              //   value: BlockChainType.scrt,
              //   isDisabled: toBlockChain === BlockChainType.scrt,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.cosmos],
              //   value: BlockChainType.cosmos,
              //   isDisabled: toBlockChain === BlockChainType.cosmos,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.juno],
              //   value: BlockChainType.juno,
              //   isDisabled: toBlockChain === BlockChainType.juno,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.crescent],
              //   value: BlockChainType.crescent,
              //   isDisabled: toBlockChain === BlockChainType.crescent,
              // },
            ],
            label: 'TO',
          }}
        />
      </BackgroundImg>
    </StyledNetworkBox>
  )
}

export default BlockChainNetwork
