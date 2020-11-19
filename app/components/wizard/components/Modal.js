import React, { useState } from 'react'
import styled from 'styled-components'
import Steps from './Steps'
import HelpPanel from './HelpPanel'
import Navbar from './Navbar'
import Dialog from './Dialog'

const Container = styled.div`
  width: 1263px;
  height: 655px;
  background-color: #fff;
  border-radius: 3px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`

const Inner = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100% - 35px);
`

const Sidebar = styled.div`
  height: 100%;
  background-color: rgba(68, 105, 176, 0.1);
`

const Content = styled.div`
  flex: auto;
  height: 100%;
  padding: 45px;
  background-color: #fff;
`

export default ({ children }) => {
  const [dialogVisible, setDialogVisible] = useState(true)

  const onNavbarClose = () => {
    setDialogVisible(!dialogVisible)
  }

  return (
    <>
      <Container>
        <Navbar onClick={onNavbarClose} />
        <Inner>
          <Sidebar>
            <Steps />
          </Sidebar>
          <Content>{children}</Content>
          <Sidebar>
            <HelpPanel />
          </Sidebar>
        </Inner>
      </Container>
      {dialogVisible && <Dialog onClose={() => setDialogVisible(false)} />}
    </>
  )
}
