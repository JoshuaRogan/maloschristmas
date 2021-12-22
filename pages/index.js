import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: 100vh;
    width: 100vw;
`;

const PAGES = {
  SPREADSHEET: 'SPREADSHEET',
  IMAGES: 'IMAGES',
}

const Router = ({ page, children }) => {
  switch (page) {
    case PAGES.SPREADSHEET:
      return <SpreadSheet />;

    default:
      return children ;
  }
};

const SpreadSheet = () => {
  return <Wrapper>
  <iframe width="100%" height="100%" src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRzLhwx8OsdXovrGZhd8TNPHMx67yUvBTb4aUSz88JTimVsAhuNJ-GnoRFpMGc-k1U4Ec4rDmQgWLy3/pubhtml?widget=true&amp;headers=false"></iframe>
</Wrapper>;
}

const NavItem = styled.div`
  height: 50px;
  :hover {
    cursor: pointer;
  }
  background: #16a085;
  width: 200px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  margin-top: 20px;
`;

const Nav = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: white;
  align-items: center;
  text-align: center;
`;


function App() {
  const [page, setPage] = React.useState('home');

  return (

    <Router page={page}>
      <Nav>
        <NavItem onClick={() => setPage(PAGES.SPREADSHEET)}> SpreadSheet </NavItem>
        <NavItem onClick={() => setPage(PAGES.IMAGES)}> Christmast Images </NavItem>
      </Nav>
    </Router>

  );
}

export default App;
