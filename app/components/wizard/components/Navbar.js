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
`

const Buttons = styled.div`
  display: flex;

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

    > img {
      margin-top: 2px;
      width: 18px;
      height: auto;
    }
  }
`

export default ({ title = 'Klara Facebook', onClick, onTabClick }) => {
  return (
    <Container>
      <span>{title}</span>
      <Buttons>
        {onTabClick && (
          <button onClick={onTabClick}>
            <img src={chrome.runtime.getURL(`images/icons/tab.png`)}></img>
          </button>
        )}
        <button onClick={onClick}>
          <img src={chrome.runtime.getURL(`images/icons/cross.png`)}></img>
        </button>
      </Buttons>
    </Container>
  )
}
