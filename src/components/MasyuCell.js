import React from 'react';
import '../styles/masyucell.css';

function MasyuCell(props) {
    return (
        <span className={`cell-container ${'board' + props.boardId} ${'xCoord' + props.xCoord} ${'yCoord' + props.yCoord}`}>
            <span className="cell">
                {
                    props.value === 1 ?
                        (<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Circle_-_black_simple.svg/500px-Circle_-_black_simple.svg.png"></img>)
                        : props.value === 2 ?
                            (<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Location_dot_black.svg/1024px-Location_dot_black.svg.png"></img>)
                            : null
                }
            </span>
        </span>
    )
}
export default MasyuCell;
