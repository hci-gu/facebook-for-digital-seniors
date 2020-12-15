import React, { useContext } from 'react'
import styled from 'styled-components'
import { actions, StateContext } from '../state'

const ContactInfo = styled.div`
  font-size: 18px !important;
  height: 100%;
`

const OptionalFields = styled.div`
  margin-top: 20px;
`

const Text = styled.span``

const Input = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;

  > span {
    width: 75px;
  }
  > input,
  > select {
    margin-left: 10px;
  }
`

export default () => {
  const { contact, dispatch } = useContext(StateContext)

  const onChange = (e, type) => {
    dispatch({
      action: actions.CONTACT_EDIT,
      payload: {
        type,
        value: e.target.value,
      },
    })
  }

  return (
    <ContactInfo>
      <Text>
        Roligt att du vill delta i studien. För att göra det behöver vi lite mer
        information om dig. Vänligen fyll i nedanstående
      </Text>
      <Input>
        <span>Ålder:</span>
        <input
          onChange={e => onChange(e, 'age')}
          value={contact.age}
          type="number"
          min="0"
          style={{ width: 100 }}
        ></input>
      </Input>
      <Input>
        <span>Kön:</span>
        <select onChange={e => onChange(e, 'sex')} value={contact.sex}>
          <option value={undefined}> -- Välj -- </option>
          <option value="female">Kvinna</option>
          <option value="male">Man</option>
          <option value={null}>Vill inte ange</option>
        </select>
      </Input>
      <OptionalFields>
        <Text>
          Om du dessutom går med på att bli kontaktad för eventuella följdfrågor
          kan du fylla i mail nedan.
        </Text>
        <Input>
          <span>Mail:</span>
          <input
            onChange={e => onChange(e, 'email')}
            value={contact.email}
            placeholder="Din epost-adress ( frivilligt )"
            style={{ width: 300 }}
          ></input>
        </Input>
      </OptionalFields>
    </ContactInfo>
  )
}
