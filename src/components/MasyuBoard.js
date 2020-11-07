import React, { useState, useEffect } from 'react';
import MasyuCell from '../components/MasyuCell';
import LineTo, { SteppedLineTo } from 'react-lineto';
import '../styles/masyuboard.css';
import { random } from 'nanoid';

function MasyuBoard(props) {

    const [boardContents, setBoardContents] = useState([]);
    const [boardSolutionPath, setBoardSolutionPath] = useState([]);
    const [boardSolutionEdges, setBoardSolutionEdges] = useState([]);
    const [boardImpossibleEdges, setBoardImpossibleEdges] = useState([]);
    const [boardImpossiblePath, setBoardImpossiblePath] = useState([]);

    const [clicked, setClicked] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const [unsolvable, setUnsolvable] = useState(false);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        generateBoard();
    }, [])

    /**
     * Board initialization functions
     */
    function generateBoard() {
        var board = [];
        var keyIdx = 0;
        for (let i = 0; i < props.rowCount; i++) {
            var rowContents = [];
            for (let j = 0; j < props.colCount; j++) {
                var cellValue = checkSquareValue(i, j);
                rowContents.push(
                    <MasyuCell key={keyIdx}
                        boardId={props.boardId}
                        value={cellValue}
                        xCoord={i}
                        yCoord={j}
                    ></MasyuCell>
                )
                keyIdx = keyIdx + 1;
            }
            board.push(rowContents);
        }
        setBoardContents(board);
    }

    function checkSquareValue(rowIndex, colIndex) {
        const arr = [];
        arr.push(rowIndex);
        arr.push(colIndex);
        if (props.whiteCircles) {
            if (props.whiteCircles.some(function (ele) {
                if (JSON.stringify(ele) === JSON.stringify(arr)) {
                    return 1;
                }
            }) === true) {
                return 1;
            } else if (props.blackCircles.some(function (ele) {
                if (JSON.stringify(ele) === JSON.stringify(arr)) {
                    return 1;
                }
            }) === true) {
                return 2;
            }
            else return 0;
        }

    }

    /**
     * Solution helpers
     */
    function getEdgeCells() {
        var result = [];
        // var numEdgeCells = 2 * props.rowCount + 2 * props.colCount - 4;
        var lastColIndex = props.colCount - 1;
        var lastRowIndex = props.rowCount - 1;
        for (let i = 0; i < props.colCount; i++) {
            result.push([0, i]);
            result.push([lastColIndex, i]);
        }
        for (let i = 0; i < props.rowCount - 2; i++) {
            result.push([i + 1, 0]);
            result.push([i + 1, lastRowIndex]);
        }
        return result;
    }

    function drawImpossibleEdges(arr){
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            var direction = arr[i][2];
            let initialPosition = 'xCoord' + arr[i][0] + ' yCoord' + arr[i][1];
            let xCoord = arr[i][0];
            let yCoord = arr[i][1];
            let coordinate = -1;
            let endPosition = '';
            if (direction === "U") {
                coordinate = xCoord - 1;
                endPosition = `${'xCoord' + coordinate + ' yCoord' + yCoord}`;
            } else if (direction === "R") {
                coordinate = yCoord + 1;
                endPosition = 'xCoord' + xCoord + ' yCoord' + coordinate;
            } else if (direction === "D") {
                coordinate = xCoord + 1;
                endPosition = 'xCoord' + coordinate + ' yCoord' + yCoord;
            } else if (direction === "L") {
                coordinate = yCoord - 1;
                endPosition = 'xCoord' + xCoord + ' yCoord' + coordinate;
            }
            result.push(<LineTo key={`lineImpossible` + i} borderStyle="dashed" className={`line-element direction${direction}`} from={`cell-container board${props.boardId} ${initialPosition}`} to={`cell-container board${props.boardId} ${endPosition}`}></LineTo>);
        }
        setBoardImpossiblePath(boardImpossiblePath.concat(result));
    }

    function drawEdges(arr) {
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            var direction = arr[i][2];
            let initialPosition = 'xCoord' + arr[i][0] + ' yCoord' + arr[i][1];
            let xCoord = arr[i][0];
            let yCoord = arr[i][1];
            let coordinate = -1;
            let endPosition = '';
            if (direction === "U") {
                coordinate = xCoord - 1;
                endPosition = `${'xCoord' + coordinate + ' yCoord' + yCoord}`;
            } else if (direction === "R") {
                coordinate = yCoord + 1;
                endPosition = 'xCoord' + xCoord + ' yCoord' + coordinate;
            } else if (direction === "D") {
                coordinate = xCoord + 1;
                endPosition = 'xCoord' + coordinate + ' yCoord' + yCoord;
            } else if (direction === "L") {
                coordinate = yCoord - 1;
                endPosition = 'xCoord' + xCoord + ' yCoord' + coordinate;
            }
            result.push(<LineTo key={`line` + i} className={`line-element direction${direction}`} from={`cell-container board${props.boardId} ${initialPosition}`} to={`cell-container board${props.boardId} ${endPosition}`}></LineTo>);
        }
        setBoardSolutionPath(...boardSolutionPath, result);
    }

    /**
     * Solution step 1 (following Masyu Algorithm Intel)
     * TODO - add solutionEdges, impossibleEdges to board state
     */
    function solutionStep1() {
        console.log("Step 1: Resolving Patterns");
        const solutionEdges = [];
        const impossibleEdges = [];
        const whiteEdgeCells = [];
        const lastColIndex = props.colCount - 1;
        const lastRowIndex = props.rowCount - 1;

        console.log("Constraint I - No white circles on a corner");
        const corner1 = [0, 0];
        const corner2 = [0, lastColIndex];
        const corner3 = [lastRowIndex, 0];
        const corner4 = [lastRowIndex, lastColIndex];
        for (let i = 0; i < props.whiteCircles.length; i++) {
            const coordinates = props.whiteCircles[i];
            if (corner1[0] === coordinates[0] && corner1[1] === coordinates[1]
                || corner2[0] === coordinates[0] && corner2[1] === coordinates[1]
                || corner3[0] === coordinates[0] && corner3[1] === coordinates[1]
                || corner4[0] === coordinates[0] && corner4[1] === coordinates[1]
            ) {
                console.log("Unsolvable - corner has white circle");
                setUnsolvable(true);
                return ('Puzzle unsolvable');
            }
        }
        console.log("Constraint II - Add edges to white cells along the edge of the board");
        const arrayOfEdgeCells = getEdgeCells();
        for (let i = 0; i < props.whiteCircles.length; i++) {
            const whiteCell = props.whiteCircles[i];
            for (let j = 0; j < arrayOfEdgeCells.length; j++) {
                if (whiteCell[0] === arrayOfEdgeCells[j][0] && whiteCell[1] === arrayOfEdgeCells[j][1]) {
                    whiteEdgeCells.push(whiteCell);
                    if (whiteCell[0] === 0) {
                        solutionEdges.push([0, whiteCell[1], 'L']);
                        solutionEdges.push([0, whiteCell[1], 'R']);
                        impossibleEdges.push([0, whiteCell[1], 'D']);
                    } else if (whiteCell[0] === lastRowIndex) {
                        solutionEdges.push([lastRowIndex, whiteCell[1], 'L']);
                        solutionEdges.push([lastRowIndex, whiteCell[1], 'R']);
                        impossibleEdges.push([lastRowIndex, whiteCell[1], 'U']);
                    } else if (whiteCell[1] === 0) {
                        solutionEdges.push([whiteCell[0], 0, 'U']);
                        solutionEdges.push([whiteCell[0], 0, 'D']);
                        impossibleEdges.push([whiteCell[0], 0, 'R']);
                    } else if (whiteCell[1] === lastColIndex) {
                        solutionEdges.push([whiteCell[0], lastColIndex, 'U']);
                        solutionEdges.push([whiteCell[0], lastColIndex, 'D']);
                        impossibleEdges.push([whiteCell[0], lastColIndex, 'L']);
                    }
                }
            }
        }
        console.log("Constraint III - For black circles that are within an edge cell, or adjacent to one");
        for (let i = 0; i < props.blackCircles.length; i++) {
            let xCoord = props.blackCircles[i][0];
            let yCoord = props.blackCircles[i][1]
            if (xCoord === 0 || xCoord === 1) {
                solutionEdges.push([xCoord, yCoord, 'D']);
                solutionEdges.push([xCoord + 1, yCoord, 'D']);
            } else if (xCoord === lastRowIndex - 1 || xCoord === lastRowIndex) {
                solutionEdges.push([xCoord, yCoord, 'U']);
                solutionEdges.push([xCoord - 1, yCoord, 'U']);
            } else if (yCoord === 0 || yCoord === 1) {
                solutionEdges.push([xCoord, yCoord, 'R']);
                solutionEdges.push([xCoord, yCoord + 1, 'R']);
            } else if (yCoord === lastColIndex - 1 || yCoord === lastColIndex) {
                solutionEdges.push([xCoord, yCoord, 'L']);
                solutionEdges.push([xCoord, yCoord - 1, 'L']);
            }
        }
        console.log("Constraint IV - White circles that are on the edge of the board, and within 1 space of another white circle");
        if (whiteEdgeCells.length > 2) {
            for (let i = 0; i < whiteEdgeCells.length; i++) {
                let whiteCircle = whiteEdgeCells[i];
                let xCoord1 = whiteCircle[0];
                let yCoord1 = whiteCircle[1];
                for (let j = i + 1; j < whiteEdgeCells.length; j++) {
                    let comparisonCircle = whiteEdgeCells[j];
                    let xCoord2 = comparisonCircle[0];
                    let yCoord2 = comparisonCircle[1];
                    if (xCoord1 === xCoord2) {
                        //right
                        if (yCoord1 === yCoord2 + 1 || yCoord1 === yCoord2 + 2) {
                            //Top row
                            if (xCoord1 === 0) {
                                solutionEdges.push([xCoord1, yCoord1 + 1, 'D']);
                                solutionEdges.push([xCoord1, yCoord2 - 1, 'D']);
                                // impossibleEdges.push([xCoord1, yCoord1 + 1, 'R']);
                                // impossibleEdges.push([xCoord1, yCoord2 - 1, 'L']);
                            } else {//bottom row
                                solutionEdges.push([xCoord1, yCoord1 + 1, 'U']);
                                solutionEdges.push([xCoord1, yCoord2 - 1, 'U']);
                                // impossibleEdges.push([xCoord1, yCoord1 - 1, 'R']);
                                // impossibleEdges.push([xCoord1, yCoord2 + 1, 'L']);


                            }
                            //left
                        } else if (yCoord1 === yCoord2 - 1 || yCoord1 === yCoord2 - 2) {
                            if (xCoord1 === 0) {
                                //Top row
                                solutionEdges.push([xCoord1, yCoord1 - 1, 'D']);
                                solutionEdges.push([xCoord1, yCoord2 + 1, 'D']);
                                // impossibleEdges.push([xCoord1, yCoord1 - 1, 'L']);
                                // impossibleEdges.push([xCoord1, yCoord2 + 1, 'R']);


                            }
                            else {//bottom row
                                solutionEdges.push([xCoord1, yCoord1 - 1, 'U']);
                                solutionEdges.push([xCoord1, yCoord2 + 1, 'U']);
                                // impossibleEdges.push([xCoord1, yCoord1 - 1, 'L']);
                                // impossibleEdges.push([xCoord1, yCoord2 + 1, 'R']);


                            }
                        }
                    }
                    if (yCoord1 === yCoord2) {
                        //below
                        if (xCoord1 === xCoord2 + 1 || xCoord1 === xCoord2 + 2) {
                            if (yCoord1 === 0) {
                                solutionEdges.push([xCoord1 + 1, yCoord1, 'R']);
                                solutionEdges.push([xCoord2 - 1, yCoord1, 'R']);
                                // impossibleEdges.push([xCoord2 + 1, yCoord1,"D"]);
                                // impossibleEdges.push([xCoord1 - 1, yCoord1,"U"]);


                            } else {
                                solutionEdges.push([xCoord1 - 1, yCoord1, 'L']);
                                solutionEdges.push([xCoord2 + 1, yCoord1, 'L']);
                                // impossibleEdges.push([xCoord1 + 1, yCoord1,"D"]);
                                // impossibleEdges.push([xCoord2 - 1, yCoord1,"U"]);
                            }
                        //above
                        } else if (xCoord1 === xCoord2 - 1 || xCoord1 === xCoord2 - 2) {
                            if (yCoord1 === 0) {
                                solutionEdges.push([xCoord1 - 1, yCoord1, 'R']);
                                solutionEdges.push([xCoord2 + 1, yCoord1, 'R']);
                                // impossibleEdges.push([xCoord2 + 1, yCoord1,"D"]);
                                // impossibleEdges.push([xCoord1 - 1, yCoord1,"U"]);
                            }
                            else {
                                solutionEdges.push([xCoord1 - 1, yCoord1, 'L']);
                                solutionEdges.push([xCoord2 + 1, yCoord1, 'L']);
                                // impossibleEdges.push([xCoord2 + 1, yCoord1,"D"]);
                                // impossibleEdges.push([xCoord1 - 1, yCoord1,"U"]);

                            }
                        }
                    }
                }
            }
        }
        console.log("Constraint VII: Two Adjacent black circles");
        for (let i = 0; i < props.blackCircles.length; i++) {
            const blackCircle = props.blackCircles[i];
            const xCoord1 = blackCircle[0];
            const yCoord1 = blackCircle[1];
            for (let j = i + 1; j < props.blackCircles.length; j++) {
                const comparison = props.blackCircles[j];
                const xCoord2 = comparison[0];
                const yCoord2 = comparison[1];
                if (xCoord1 === xCoord2) {
                    if (yCoord1 === yCoord2 - 1) {
                        solutionEdges.push([xCoord1, yCoord1, 'L']);
                        solutionEdges.push([xCoord1, yCoord1 - 1, 'L']);
                        solutionEdges.push([xCoord2, yCoord2, 'R']);
                        solutionEdges.push([xCoord2, yCoord2 + 1, 'R']);
                    } else if (yCoord1 === yCoord2 + 1) {
                        solutionEdges.push([xCoord2, yCoord2, 'L']);
                        solutionEdges.push([xCoord2, yCoord2 - 1, 'L']);
                        solutionEdges.push([xCoord1, yCoord1, 'R']);
                        solutionEdges.push([xCoord1, yCoord1 + 1, 'R']);
                    }
                } else if (yCoord1 === yCoord2) {
                    if (xCoord1 === xCoord2 - 1) {
                        solutionEdges.push([xCoord1, yCoord1, 'U']);
                        solutionEdges.push([xCoord1 - 1, yCoord1, 'U']);
                        solutionEdges.push([xCoord2, yCoord2, 'D']);
                        solutionEdges.push([xCoord2 + 1, yCoord2, 'D']);
                    } else if (xCoord1 === xCoord2 + 1) {
                        solutionEdges.push([xCoord2, yCoord2, 'U']);
                        solutionEdges.push([xCoord2 - 1, yCoord2, 'U']);
                        solutionEdges.push([xCoord1, yCoord1, 'D']);
                        solutionEdges.push([xCoord1 + 1, yCoord1, 'D']);
                    }
                }
            }
        }
        console.log("Constraint VI: 3+ consecutive white circles interior");
        let rowArray = [];
        let colArray = [];
        let dimension = props.colCount;
        for (let i = 0; i < dimension; i++) {
            rowArray[`row${i}`] = [];
            colArray[`col${i}`] = [];
        }
        for (let i = 0; i < props.whiteCircles.length; i++) {
            let xCoord = props.whiteCircles[i][0];
            let yCoord = props.whiteCircles[i][1];
            rowArray[`row${xCoord}`] = rowArray[`row${xCoord}`].concat(props.whiteCircles[i][1]);
            colArray[`col${yCoord}`] = colArray[`col${yCoord}`].concat(props.whiteCircles[i][0]);
        }
        //TODO - Some improvements for this (if an edge cell, do not add additional edges to solutionEdges)
        console.log(rowArray);
        console.log(colArray);
        for (let i = 0; i < dimension; i++) {
            if (rowArray[`row${i}`].length >= 3) {
                console.log("More than 3 white circles in a row, do sorting")
                let rowYCoordinates = rowArray[`row${i}`].sort(function (a, b) {
                    return a - b;
                });
                console.log(rowYCoordinates);
                let lastWhiteCircleIndex = -1;
                let consecutiveCircles = 0;

                for (let j = 0; j < rowYCoordinates.length; j++) {
                    let value = rowYCoordinates[j];
                    console.log(consecutiveCircles);
                    if (j === 0) {
                        lastWhiteCircleIndex = value;
                        consecutiveCircles = 1;
                    } else if (lastWhiteCircleIndex === value - 1) {
                        consecutiveCircles = consecutiveCircles + 1;
                        lastWhiteCircleIndex = value;
                        if (j === rowYCoordinates.length - 1) {
                            if (consecutiveCircles >= 3) {
                                console.log("Adding edges to 3+ consecutive white circles");
                                for (let k = 0; k < consecutiveCircles; k++) {
                                    let idx = lastWhiteCircleIndex - k
                                    solutionEdges.push([i, idx, 'U']);
                                    solutionEdges.push([i, idx, 'D']);
                                }
                            }
                        }
                    } else if (lastWhiteCircleIndex !== value - 1) {
                        if (consecutiveCircles >= 3) {
                            console.log("Adding edges to 3+ consecutive white circles");
                            for (let k = 0; k < consecutiveCircles; k++) {
                                let idx = lastWhiteCircleIndex - k;
                                solutionEdges.push([i, idx, 'U']);
                                solutionEdges.push([i, idx, 'D']);
                            }
                        }
                        lastWhiteCircleIndex = value;
                        consecutiveCircles = 1;
                    }
                }
            } else if (colArray[`col${i}`].length >= 3) {
                console.log("More than 3 white circles in a column, do sorting")
                let columnIndex = i;
                let colXCoordinates = colArray[`col${i}`].sort(function (a, b) {
                    return a - b;
                });
                console.log(colXCoordinates);
                let lastWhiteCircleIndex = -1;
                let consecutiveCircles = 0;

                for (let j = 0; j < colXCoordinates.length; j++) {
                    let value = colXCoordinates[j];
                    console.log(consecutiveCircles);
                    if (j === 0) {
                        lastWhiteCircleIndex = value;
                        consecutiveCircles = 1;
                    } else if (lastWhiteCircleIndex === value - 1) {
                        consecutiveCircles = consecutiveCircles + 1;
                        lastWhiteCircleIndex = value;
                        if (j === colXCoordinates.length - 1) {
                            if (consecutiveCircles >= 3) {
                                console.log("Adding edges to 3+ consecutive white circles");
                                for (let k = 0; k < consecutiveCircles; k++) {
                                    let idx = lastWhiteCircleIndex - k
                                    solutionEdges.push([idx, i, 'L']);
                                    solutionEdges.push([idx, i, 'R']);
                                }
                            }
                        }
                    } else if (lastWhiteCircleIndex !== value - 1) {
                        if (consecutiveCircles >= 3) {
                            console.log("Adding edges to 3+ consecutive white circles");
                            for (let k = 0; k < consecutiveCircles; k++) {
                                let idx = lastWhiteCircleIndex - k;
                                solutionEdges.push([idx, i, 'L']);
                                solutionEdges.push([idx, i, 'R']);
                            }
                        }
                        lastWhiteCircleIndex = value;
                        consecutiveCircles = 1;
                    }
                }
            }
        }
        drawEdges(solutionEdges);
        setBoardSolutionEdges(boardSolutionEdges.concat(solutionEdges));
        setBoardImpossibleEdges(boardImpossibleEdges.concat(impossibleEdges));

        //Impossibility constraints - this is only necessary to add, if we need to handle unsolvable puzzles
        // console.log("Constraint V: 3 white circles with one space between each other, on the edge of the board, (impossible condition)");
        // console.log("Constraint VII: Three consecutive black circles (impossible condition)");
        // console.log("Constraint IX: Black circle diagonally adjacent to two white circles in the same row/col (impossible condition)");

    }

    //TODO - Run steps 2 and 3 to find a solution
    async function asyncCall() {
        let results = await (solutionStep2and3());

    }

    function solutionStep2and3() {
        console.log("Step 2: Remove impossible moves");
        drawImpossibleEdges(boardImpossibleEdges);

        console.log("Step 3: Add an edge and determine if its impossible");
        // while (solved === false) {
        // }


    }

    function solveBoardStep1() {
        setClicked(true);
        console.log("Solving board");
        var t0 = performance.now();
        solutionStep1();
        var t1 = performance.now();

        if (unsolvable === false) {
            var time = "It took " + ((t1 - t0) / 1000) + " s to run the first step of the algorithm";
            console.log(time);
            setResultMessage(time);
            console.log(boardSolutionEdges);
            console.log(boardImpossibleEdges);


        }

    }
    return (
        <React.Fragment>
            <div className={`board col${props.colCount}`}>
                {boardContents}
                {boardSolutionPath}
                {boardImpossiblePath}
            </div>
            <div className="button_message_container">
                {clicked === false ? (<button onClick={() => solveBoardStep1()}>Solve Step 1</button>)
                    : unsolvable === true ? "The puzzle is unsolvable" : (
                        <React.Fragment>
                            <button onClick={() => asyncCall()}>Solve Step 2</button>
                            <p>{resultMessage}</p>
                        </React.Fragment>
                    )}
            </div>
        </React.Fragment>
    )
}

export default MasyuBoard;
