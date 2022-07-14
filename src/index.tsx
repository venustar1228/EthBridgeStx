import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { RecoilRoot } from 'recoil'
import reportWebVitals from './reportWebVitals'

import { Connect } from '@stacks/connect-react'
import { Buffer } from '@stacks/common'

import { userSession } from './pages/Send'

global.Buffer = Buffer

ReactDOM.render(
  <React.StrictMode>
    <Connect
      authOptions={{
        appDetails: {
          name: 'Stacks Template',
          // todo:
          icon: window.location.origin + '/logo.png',
        },
        redirectTo: '/',
        onFinish: (): void => {
          window.location.reload()
        },
        userSession,
      }}
    >
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Connect>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
