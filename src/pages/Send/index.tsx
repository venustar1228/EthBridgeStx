//@ts-nocheck
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useRecoilState, useRecoilValue } from 'recoil'
import _ from 'lodash'

import loading from 'images/loading.gif'
import failed from 'images/failed.gif'
import complete from 'images/complete.gif'

import { COLOR, STYLE } from 'consts'

import SendProcessStore, { ProcessStatus } from 'store/SendProcessStore'

import useSendValidate from 'hooks/useSendValidate'

import { Container } from 'components'
import FormTitle from './FormTitle'
import { Button } from 'components'
import SendForm from './SendForm'
import Confirm from './Confirm'
import Finish from './Finish'
import SendFormButton from './SendFormButton'
import BlockChainNetwork from './BlockChainNetwork'
import FormImage from 'components/FormImage'
import FinishButton from './FinishButton'
import AuthStore from 'store/AuthStore'
import useAuth from 'hooks/useAuth'
import SendStore from 'store/SendStore'
import useSelectWallet from 'hooks/useSelectWallet'
import { BlockChainType, BridgeType } from 'types/network'
import testnetSvg from '../../images/testnet.svg'
import NetworkStore from 'store/NetworkStore'
import {
  InfoElement,
  WarningElement,
  WarningInfo,
} from './SendForm/WarningInfo'

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  //bufferCVFromString,
  NonFungibleConditionCode,
  createAssetInfo,
  makeContractNonFungiblePostCondition,
  uintCV,
  PostConditionMode,
  //  contractPrincipalCVFromAddress,
  //intCV,
  // FungibleConditionCode,
  // makeStandardNonFungiblePostCondition,
  // makeStandardSTXPostCondition,
  // standardPrincipalCV,
} from '@stacks/transactions'

import {
  StacksTestnet,
  // StacksMocknet
} from '@stacks/network'

import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import mintContractABI from './mintContractABI'

const StyledProcessCircle = styled.div`
  height: 128px;
  width: 128px;
  margin: auto;
  border-radius: 100px;
  border: 1px solid #4abcf0;
  box-shadow: 0 2px 4px 0 rgba(15, 15, 24, 0.3),
    0 -1px 4px 0 rgba(119, 232, 255, 0.5);
  align-items: center;
  justify-content: center;
`

const StyledContainer = styled(Container)`
  max-width: 640px;
  padding: 0;
  height: 100%;
  @media ${STYLE.media.mobile} {
    width: 100vw;
    overflow-x: hidden;
  }
`

const StyledForm = styled.div`
  position: relative;
  background-color: ${COLOR.black};
  padding: 60px;
  border-radius: 2em;
  @media ${STYLE.media.mobile} {
    border-radius: 0;
    padding: 38px 24px 20px;
  }
`

const TestnetImg = styled.img`
  position: absolute;
  top: 0;
  right: 0;
`

let web3: Web3
if (Web3.givenProvider) {
  web3 = new Web3(Web3.givenProvider)
}

const mintContractAddress = '0xeF318ce0C5FB611ceDb6F6184A0a37d2F44c38D5'
let mintContract = new web3.eth.Contract(
  mintContractABI as AbiItem,
  mintContractAddress
)

const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

const authenticate = (): void => {
  console.log('Connect Wallet Test')
  showConnect({
    appDetails: {
      name: 'Stacks React Starter',
      icon: window.location.origin + '/logo512.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload()
    },
    userSession,
  })
}

const Send = (): ReactElement => {
  const formScrollView = useRef<HTMLDivElement>(null)

  const [status, setStatus] = useRecoilState(SendProcessStore.sendProcessStatus)
  const isLoggedIn = useRecoilValue(AuthStore.isLoggedIn)
  const { getLoginStorage, logout } = useAuth()
  const [initPage, setInitPage] = useState(false)
  const [toBlockChain, setToBlockChain] = useRecoilState(SendStore.toBlockChain)
  const [fromBlockChain, setFromBlockChain] = useRecoilState(
    SendStore.fromBlockChain
  )
  const [bridgeUsed, setBridgeUsed] = useRecoilState(SendStore.bridgeUsed)
  const isTestnet = useRecoilValue(NetworkStore.isTestnet)

  const { validateFee } = useSendValidate()
  const feeValidationResult = validateFee()

  const network = new StacksTestnet()

  const renderProcessStatus = useCallback((): ReactElement => {
    switch (status) {
      case ProcessStatus.Done:
        return (
          <StyledProcessCircle>
            <FormImage src={complete} />
          </StyledProcessCircle>
        )
      case ProcessStatus.Failed:
        return (
          <StyledProcessCircle
            style={{
              boxShadow:
                '0 2px 4px 0 rgba(254, 99, 99, 0.3), 0 -1px 4px 0 rgba(255, 119, 119, 0.5)',
              border: 'solid 1px #ff5964',
            }}
          >
            <FormImage src={failed} />
          </StyledProcessCircle>
        )
      case ProcessStatus.Pending:
        return (
          <StyledProcessCircle style={{ marginBottom: 60 }}>
            <FormImage
              src={loading}
              size={140}
              style={{ marginLeft: -6, marginTop: -6 }}
            />
          </StyledProcessCircle>
        )
      default:
        return (
          <div style={{ marginBottom: 100 }}>
            <BlockChainNetwork />
          </div>
        )
    }
  }, [status])

  const onClickGoBackToSendInputButton = async (): Promise<void> => {
    setStatus(ProcessStatus.Input)
  }

  const selectWallet = useSelectWallet()

  useEffect(() => {
    setInitPage(true)
    const { lastFromBlockChain, lastToBlockChain, bridgeUsed } =
      getLoginStorage()

    // TODO: remove after Axelar intagration
    if (
      bridgeUsed !== BridgeType.ibc &&
      bridgeUsed !== BridgeType.axelar &&
      fromBlockChain !== BlockChainType.ethereum
    ) {
      logout()
      setToBlockChain(BlockChainType.stx)
      setBridgeUsed(BridgeType.axelar)
      setFromBlockChain(BlockChainType.ethereum)
    } else if (false === isLoggedIn && lastFromBlockChain) {
      // default network is terra
      if (lastFromBlockChain === BlockChainType.stx) {
        selectWallet.open()
      } else {
        setFromBlockChain(lastFromBlockChain)
      }
      lastToBlockChain && setToBlockChain(lastToBlockChain)
      bridgeUsed &&
        lastToBlockChain !== lastFromBlockChain &&
        setBridgeUsed(bridgeUsed)
    }
  }, [])

  useEffect(() => {
    if (initPage) {
      if (false === isLoggedIn) {
        selectWallet.open()
      }

      if (
        fromBlockChain !== BlockChainType.stx &&
        fromBlockChain !== toBlockChain
      ) {
        setToBlockChain(BlockChainType.stx)
      }
    }
  }, [fromBlockChain])

  useEffect(() => {
    const scroll = formScrollView.current
    if (scroll) {
      if (status === ProcessStatus.Input) {
        scroll.scrollTo({ left: 0, behavior: 'smooth' })
      } else if (status === ProcessStatus.Confirm) {
        scroll.scrollTo({ left: 600, behavior: 'smooth' })
      }
    }
  }, [status])

  const contractAddress = 'ST10M9SK9RE5Z919TYVVMTZF9D8E0D6V8GR11BPA5'
  const contractName = 'stx-nft-minting'
  const postConditionCode = NonFungibleConditionCode.DoesNotOwn
  const derivationPath = "m/44'/5757'/0'/0/1"
  console.console.log('derivationPath', derivationPath)

  //const postConditionMode = PostConditionMode.Allow;
  // const assetAddress = 'ST10M9SK9RE5Z919TYVVMTZF9D8E0D6V8GR11BPA5'
  // const assetContractname = 'stx-nft-minting'
  // const assetName = 'arties'
  const tokenAssetName = uintCV(1)
  const nonFungibleAssetInfo = createAssetInfo(
    'ST10M9SK9RE5Z919TYVVMTZF9D8E0D6V8GR11BPA5',
    'stx-nft-minting',
    'arties'
  )

  const contractNonFungiblePostCondition = [
    makeContractNonFungiblePostCondition(
      contractAddress,
      contractName,
      postConditionCode,
      nonFungibleAssetInfo,
      tokenAssetName
    ),
  ]

  console.log('IMPORTANT!!!', contractNonFungiblePostCondition)

  const runSmartContract = async (
    contract: any,
    func: any,
    args = [],
    options: any
  ): void => {
    let accounts = await web3.eth.requestAccounts()
    if (accounts.length === 0) {
      alert('accounts.length = 0')
      return false
    }

    if (!contract) return false
    if (!contract.methods[func]) return false
    const promiEvent = await contract.methods[func](...args).send(
      Object.assign({ from: accounts[0] }, options)
    ) //this doesn't work now.
    console.log('result', promiEvent)
    return promiEvent
  }

  const transferNFT = async (): Promise<void> => {
    const txOptions = {
      contractAddress: 'ST10M9SK9RE5Z919TYVVMTZF9D8E0D6V8GR11BPA5',
      contractName: 'stx-nft-minting',
      network,
      functionName: 'transfer',
      postConditionMode: PostConditionMode.Allow,
      functionArgs: [
        uintCV(1),
        principalCV('ST10M9SK9RE5Z919TYVVMTZF9D8E0D6V8GR11BPA5'),
        principalCV('ST2DWVJSBJ1KF9VJN9GB6WQBC45PVNPGF66MBWZW3'),
      ],
      senderKey:
        'df6a1fe51a9a5202f056515ab27d721d5f13f44c96ed1da7fcbaff046af11c7901',
      validateWithAbi: true,
      contractNonFungiblePostCondition,
      anchorMode: AnchorMode.Any,
    }

    console.log('*********************************')
    console.log(txOptions)
    console.log('*********************************')

    const transaction = await makeContractCall(txOptions)
    console.log('/////////////////////////////////////////////////')

    const broadcastResponse = await broadcastTransaction(transaction, network)
    const txId = broadcastResponse.txid
    console.log('txId: ', txId)

    await runSmartContract(mintContract, 'mint')
  }

  return (
    <StyledContainer>
      <StyledForm key={_.toString(isLoggedIn)}>
        {isTestnet && <TestnetImg src={testnetSvg} />}

        {/* FormTitle */}
        <FormTitle
          onClickGoBackToSendInputButton={onClickGoBackToSendInputButton}
        />

        {/* Select From, To Blockchain Network */}
        <div style={{ textAlign: 'center' }}>{renderProcessStatus()}</div>

        {[ProcessStatus.Done, ProcessStatus.Failed].includes(status) ? (
          <>
            <Finish />
            <WarningInfo />
            <FinishButton />
          </>
        ) : (
          <>
            <div style={{ marginTop: -40 }}>
              <div style={{ marginTop: -40 }}>
                <InfoElement>
                  This is a Cross Chain Bridge to exchange NFTs between Ethereum
                  and STX.
                </InfoElement>
              </div>
            </div>
            <br></br>
            <div
              ref={formScrollView}
              style={{ display: 'flex', overflowX: 'hidden' }}
            >
              <div style={{ minWidth: '100%' }}>
                <SendForm feeValidationResult={feeValidationResult} />
              </div>
              <div style={{ minWidth: '100%' }}>
                <Confirm />
                <div style={{ marginTop: -40 }}>
                  {bridgeUsed === BridgeType.axelar && (
                    <div style={{ marginTop: 60 }}>
                      <WarningElement>
                        The{' '}
                        {fromBlockChain === BlockChainType.stx
                          ? 'Station'
                          : 'MetaMask'}{' '}
                        popup may take a few seconds to open. Please don't
                        refresh or close this page in the meantime.
                      </WarningElement>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <WarningInfo />

            {[
              ProcessStatus.Input,
              ProcessStatus.Submit,
              ProcessStatus.Confirm,
            ].includes(status) && (
              <SendFormButton feeValidationResult={feeValidationResult} />
            )}
            <br />
            <Button onClick={authenticate}>Connect Wallet Test</Button>

            <br />
            <Button onClick={transferNFT}>Transfer</Button>
          </>
        )}
      </StyledForm>
    </StyledContainer>
  )
}

export default Send
