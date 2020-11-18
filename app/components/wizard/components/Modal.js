import React from 'react'
import styled from 'styled-components'
import Steps from './Steps'
import HelpPanel from './HelpPanel'

const Container = styled.div`
  width: 1263px;
  height: 655px;
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

  display: flex;
  justify-content: flex-end;

  > button {
    cursor: pointer;
    background-color: #4469b0;
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    outline: none;

    font-size: 14px;
    font-weight: bold;
    padding: 0 10px;

    :active {
      opacity: 0.5;
    }
  }
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
  return (
    <Container>
      <Navbar>
        <button>╳</button>
      </Navbar>
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
  )
}
