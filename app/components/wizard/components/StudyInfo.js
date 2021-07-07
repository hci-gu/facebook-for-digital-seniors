import React, { useState } from 'react'
import styled from 'styled-components'
import Navbar from './Navbar'
import Button from './Button'

const Container = styled.div`
  left: 0;
  top: 0;
  z-index: 1000 !important;
  position: absolute;
  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);
`

const Dialog = styled.div`
  z-index: 1001 !important;
  position: absolute;
  width: 900px;
  height: 600px;
  top: calc(50% - 300px);
  left: calc(50% - 450px);

  background-color: white;
  border-radius: 5px;
  overflow: hidden;
`

const Content = styled.div`
  height: calc(100% - 35px);
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  > div {
    > span {
      text-decoration: underline;
    }
    > p {
      margin: 0;
      margin-bottom: 10px;

      > ul {
        margin: 0;
      }
    }
    > h1 {
      font-size: 18px !important;
    }
  }
`

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

const InfoDialog = ({ onClose }) => {
  return (
    <Container>
      <Dialog>
        <Navbar title="Information om studien" onClick={onClose} />
        <Content>
          <div>
            <span>Studien och dess syfte</span>
            <p>
              Många över 65 år använder sociala medier och vi förväntar oss att
              det kommer öka under de kommande åren eftersom de flesta under 65
              nuförtiden använder sociala medier större delen av sitt liv. Vi
              fokuserar på Facebook för att förstå hur sociala medier ser ut att
              anpassas i människors åldrande. Den här tillägget du installerade
              är det första försöket att göra detta.
            </p>
            <span>Vilka uppgifter vi samlar in</span>
            <p>
              Vi samlar in data relaterade till din interaktion med tillägget,
              t.ex. vilka FB-funktioner du valde att se eller dölja genom
              formuläret, hur ofta du besöker facebook, samt varje gång
              tillägget slås av/på. Vi skickar ett frågeformulär om din
              erfarenhet av tillägget veckovis som du kan välja att svara på.
            </p>
            <span>Säkerhet för dina uppgifter</span>
            <p>
              Vi ser till att vi har vidtagit alla nödvändiga åtgärder för att
              hålla dina uppgifter säkra.
            </p>
            <span>Två sätt att delta</span>
            <p>
              <ul>
                <li>
                  Du kan delta och ge oss möjlighet att kontakta dig genom att
                  ge oss din e-post och några allmänna detaljer om dig själv.
                </li>
                <li>
                  Du kan delta utan att ge oss din e-post och bara några
                  allmänna detaljer om dig.
                </li>
              </ul>
            </p>
            <span>Du kan alltid dra tillbaka</span>
            <p>
              Om du ändrar dig för ditt deltagande eller typen av ditt
              deltagande kan du alltid trycka på "Hoppa av" knappen som finns
              efter du är klar med formuläret i menyn för tillägget. Kontakta
              annars oss på e-post och meddela att du vill återkalla. Det är
              viktigt att informera oss om att om du vill sluta vara en del i
              vår forskning för att hjälpa dig att helt avinstallera tillägget
              och ta bort data samlat från dig.
            </p>
            <span>Integriteten av vår forskning</span>
            <p>
              Denna forskning accepterades av Etikprövningsmyndigheten och fick
              finansiering av Familjen Kamprads Stiftelse.
            </p>
            <span>För mer information om studien</span>
            <p>
              besök{' '}
              <a
                href="http://www.digitalaseniorer.org/"
                target="_blank"
                rel="noreferrer"
              >
                http://www.digitalaseniorer.org/
              </a>{' '}
              eller kontakta oss via e-post som du kan hitta här{' '}
              <a
                href="http://www.digitalaseniorer.org/kontakt"
                target="_blank"
                rel="noreferrer"
              >
                http://www.digitalaseniorer.org/kontakt
              </a>{' '}
            </p>
          </div>
          <Buttons>
            <Button onClick={onClose}>Stäng</Button>
          </Buttons>
        </Content>
      </Dialog>
    </Container>
  )
}

const InfoText = styled.span`
  font-size: 16px;
  > a {
    font-size: 18px;
    cursor: pointer;
    font-weight: bold;

    color: #4469b0;
    text-decoration: none;
    padding-bottom: 0.5px;
    border-bottom: 0.5px solid #4469b0;
  }
`

export default () => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <InfoText>
        Om du är intresserad av detaljer kring studien kan du läsa mer om den{' '}
        <a onClick={() => setVisible(true)}>här</a>
      </InfoText>
      {visible && <InfoDialog onClose={() => setVisible(false)} />}
    </>
  )
}
