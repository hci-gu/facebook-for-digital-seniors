import React from 'react'
import styled from 'styled-components'

const HelpIcon = styled.span`
  display: inline-block;
  position: relative;
  width: 26px;
  height: 10px;

  > svg {
    position: absolute;
    left: 4px;
    top: -6px;
  }
`

export default () => {
  return (
    <HelpIcon>
      <svg
        width="19"
        height="19"
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.50002 0C4.26178 0 0 4.26178 0 9.50002C0 14.7383 4.26178 19 9.50002 19C14.7383 19 19 14.7383 19 9.50002C19 4.26178 14.7382 0 9.50002 0ZM10.118 15.1366C9.66663 15.2119 8.76856 15.3998 8.31251 15.4375C7.92648 15.4695 7.5622 15.2485 7.34014 14.9313C7.11749 14.6142 7.06414 14.2083 7.19632 13.8441L8.99207 8.90628H7.125C7.1234 7.87737 7.89516 7.12083 8.88225 6.83048C9.3533 6.69189 10.2309 6.50223 10.6875 6.53129C10.961 6.54869 11.4378 6.7203 11.6599 7.0375C11.8825 7.35467 11.9359 7.76056 11.8037 8.12469L10.0079 13.0626H11.8744C11.8748 14.0903 11.1318 14.9676 10.118 15.1366ZM10.6875 5.93752C10.0316 5.93752 9.49998 5.4058 9.49998 4.75001C9.49998 4.09415 10.0316 3.5625 10.6875 3.5625C11.3434 3.5625 11.875 4.09415 11.875 4.75001C11.875 5.40583 11.3434 5.93752 10.6875 5.93752Z"
          fill="#1D2129"
        />
      </svg>
    </HelpIcon>
  )
}
