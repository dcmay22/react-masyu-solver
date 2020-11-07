import React from 'react';
import logo from './logo.svg';
import './App.css';
import MasyuContainer from '../src/components/MasyuContainer'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <React.Fragment>
        <p>Masyu Solver</p>
      <MasyuContainer></MasyuContainer>
      </React.Fragment>
      </header>
    </div>
  );
}

export default App;
