import React, { useContext } from 'react'
import styled from 'styled-components'
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider'

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 25px;

  > span {
    padding: 5px;
  }

  > div:nth-child(2) {
    border: 2px solid rgba(0, 0, 0, 0.1);
    width: 640px;
    height: 320px;
  }
`

const GULogo = styled.img`
  position: absolute;
  top: 0;
  right: 0;

  width: 90px;
  height: auto;
`

const Texts = styled.div`
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h1 {
    font-size: 28px !important;
    font-weight: bold !important;
    margin: 0 !important;
  }
  > h2 {
    font-size: 18px !important;
  }
`

const Handle = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--rcs-handle-width);
  height: 100%;
  box-shadow: none;
  background-color: black;
  cursor: pointer;
  width: 2px;
  height: 100%;

  > div {
    cursor: pointer;
    position: absolute;
    width: 40px;
    height: 40px;

    border: 2px solid black;
    border-radius: 50%;

    backdrop-filter: blur(0.5rem);
    overflow: hidden;

    &::before,
    &::after {
      content: '';
      display: block;
      border-top: 0.5rem solid transparent;
      border-bottom: 0.5rem solid transparent;
    }

    &::before {
      margin-top: 10px;
      margin-right: 22.5px !important;
      border-right: 0.65rem solid black;
    }

    &::after {
      margin-top: -16px;
      margin-left: 23px !important;
      border-left: 0.65rem solid black;
    }
  }
`

const getImage = image => {
  let imagePath
  try {
    imagePath = chrome.runtime.getURL(`images/${image}.png`)
  } catch (e) {
    imagePath = `./app/images/${image}.png`
  }
  return imagePath
}

const image = name => {
  return (
    <ReactCompareSliderImage
      src={getImage(name)}
      srcSet={getImage(name)}
      alt={`Facebook ${name}`}
    />
  )
}

const handle = () => {
  return (
    <Handle>
      <div>
        <div />
        <div />
      </div>
    </Handle>
  )
}

export default () => {
  return (
    <Container>
      <Texts>
        <h1>Klara Facebook</h1>
        <h2>Förenkla din upplevelse på Facebook</h2>
        <GULogo src={chrome.runtime.getURL(`images/gu_logo.png`)} />
      </Texts>
      <ReactCompareSlider
        itemOne={image('before')}
        itemTwo={image('after')}
        handle={handle()}
      />
      <span>
        Exempel på hur Facebook kan se ut före och efter du gått igenom den här
        introduktionen.
      </span>
    </Container>
  )
}
