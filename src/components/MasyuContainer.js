import React, { useState, useEffect } from 'react';
import boardData from '../data/Boards.json';
import MasyuBoard from '../components/MasyuBoard'
import '../styles/masyucontainer.css';

//Initialize boards
function MasyuContainer() {
    
    const [boardArray, setBoardArray] = useState([]);

    function renderBoards() {
        const boards = [];
        if (boardData.length > 0) {
            for (let i = 0; i < boardData.length; i++) {
                let rowCount = boardData[i].rowDimension;
                let colCount = boardData[i].colDimension;
                let whiteCircles = boardData[i].whiteCircleArray;
                let blackCircles = boardData[i].blackCircleArray;
                let boardTitle = boardData[i].boardName;
                console.log(whiteCircles)
                boards[i] =
                    <React.Fragment key={i}>
                        <MasyuBoard key={i}
                            boardId={i}
                            boardTitle={boardTitle}
                            rowCount={rowCount}
                            colCount={colCount}
                            whiteCircles={whiteCircles}
                            blackCircles={blackCircles}
                        ></MasyuBoard>
                        <br /><br />
                    </React.Fragment>
            }
        }
        setBoardArray(boards);
    }


    useEffect(() => {
        renderBoards();
    }, []);

    return (
        boardArray
    )
}

export default MasyuContainer;
