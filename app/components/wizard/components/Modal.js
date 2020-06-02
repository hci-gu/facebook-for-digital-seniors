import React from 'react'
import styled from 'styled-components'
import Steps from './Steps'

const Container = styled.div`
  width: 935px;
  height: 555px;
  background-color: #fff;
  border-radius: 3px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`

const Navbar = styled.div`
  width: 100%;
  height: 35px;
  background-color: #4469b0;
`

const Inner = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100% - 35px);
`

const Sidebar = styled.div`
  width: 247px;
  height: 100%;
  background-color: rgba(68, 105, 176, 0.1);
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  padding: 45px;
  background-color: #fff;
`

export default ({ children }) => {
  return (
    <Container>
      <Navbar />
      <Inner>
        <Sidebar>
          <Steps />
        </Sidebar>
        <Content>{children}</Content>
      </Inner>
    </Container>
  )
}
