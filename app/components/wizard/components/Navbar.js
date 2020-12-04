import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  height: 35px;
  background-color: #4469b0;

  display: flex;
  justify-content: flex-end;
  justify-content: space-between;

  > span {
    color: white;
    padding: 10px;
    line-height: 100%;
  }

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

export default ({ title = 'Klara Facebook', onClick }) => {
  return (
    <Container>
      <span>{title}</span>
      <button onClick={onClick}>╳</button>
    </Container>
  )
}
