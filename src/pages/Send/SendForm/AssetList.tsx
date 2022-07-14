import { ReactElement } from 'react'
import { useSetRecoilState } from 'recoil'

import { Button } from 'components'

import SendProcessStore, { ProcessStatus } from 'store/SendProcessStore'

const AssetList = (): ReactElement => {
  const setStatus = useSetRecoilState(SendProcessStore.sendProcessStatus)

  const onClickHomeButton = async (): Promise<void> => {
    setStatus(ProcessStatus.Input)
  }

  return <Button onClick={onClickHomeButton}>Home</Button>
}

export default AssetList
