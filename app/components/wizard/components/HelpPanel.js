import React, { useContext } from 'react'
import styled from 'styled-components'
import { StateContext } from '../state'

import HelpIcon from './HelpIcon'

const Container = styled.div`
  width: 329px;
  padding: 20px;
`

const Title = styled.h1`
  font-weight: bold !important;
  font-size: 18px !important;
`

const Description = styled.p``

const Image = styled.img`
  background-color: gray;
  max-width: 100%;
`

const getImage = image => {
  let imagePath
  try {
    imagePath = chrome.runtime.getURL(`images/tooltip/${image}.png`)
  } catch (e) {
    imagePath = `./app/images/tooltip/${image}.png`
  }
  return imagePath
}

export default () => {
  const { help } = useContext(StateContext)
  return (
    <Container>
      {help ? (
        <>
          <Title>{help.title}</Title>
          <Description>{help.description.split('\n').map(text => {
            return <>
              <span>{text}</span>
              <br></br>
            </>
          })}</Description>
          <Image src={getImage(help.image)} />
        </>
      ) : (
        <>
          <Title>Hjälppanel</Title>
          <Description>
            Tryck på den här symbolen <HelpIcon /> för att få en förklaring av
            funktionaliteten.
          </Description>
        </>
      )}
    </Container>
  )
}
