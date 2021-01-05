import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
`;

function App() {
  return (
    <Wrapper>
      <iframe width="100%" height="100%" src="https://docs.google.com/spreadsheets/d/15s8PgJ8uZNcUsUEvM2gO2Si3fCJ4spwsAqh6f0xxJGM/edit?ouid=110939666120885358976&usp=sheets_home&ths=true"></iframe>
    </Wrapper>
  );
}

export default App;
