import React, {createRef, useEffect, useState} from "react";
import GridNode from "./Node/GridNode";
import "./PathfindingVisualizer.css";
import {dijkstraSP, shortestPath} from "./Algorithms/DijkstraSP";
import {Node} from "./Node/Node";
import {dfsPath, dfsVisited} from "./Algorithms/DFS";
import {bfsPath, bfsVisited} from "./Algorithms/BFS";
import update from 'immutability-helper';
import {recursiveDivision} from "./MazeGeneration/RecursiveDivision";
import AlgoButtonSetting from "../Common/Settings/AlgoButtonSetting";
import {disabledButtonStyle, enabledButtonStyle} from "../Common/Styles";
import AlgoButton from "../Common/AlgoButton";

const options = ["DFS", "BFS", "Dijkstra", "A*"];

function PathfindingVisualizer() {
  const dropdownSelection = createRef<HTMLDivElement>();
  const dropdownCaret = createRef<HTMLDivElement>();

  const [grid, setGrid] = useState<Node[][]>([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [rows, setRows] = useState(31);
  const [cols, setCols] = useState(31);
  const [algorithm, setAlgorithm] = useState("Dijkstra");
  const [showAlgorithms, setShowAlgorithms] = useState(false);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const [nodeStyle, setNodeStyle] = useState({width: "20px", height: "20px"});
  const [visitedNodes, setVisitedNodes] = useState<Node[]>([]);
  const [pathNodes, setPathNodes] = useState<Node[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState(enabledButtonStyle);
  const [pathfindingSpeed, setPathfindingSpeed] = useState(20);
  const [clickedRun, setClickedRun] = useState(false);
  const [startRow, setStartRow] = useState(3);
  const [startCol, setStartCol] = useState(3);
  const [finishRow, setFinishRow] = useState(27);
  const [finishCol, setFinishCol] = useState(27);
  const [clickedOnStartNode, setClickedOnStartNode] = useState(false);
  const [clickedOnFinishNode, setClickedOnFinishNode] = useState(false);

  useEffect(() => {
    resizeGrid();
    setGrid(getInitialGrid);
    let root = document.getElementById("grid-wrapper");
    root!.ontouchmove = (e) => {
      // why does this work??? is this a reference to state grid??? is it cause of pass by val??
      const wallsGrid: Node[][] = grid.slice();
      for (let i = 0; i < e.changedTouches.length; i++) {
        let element = e.changedTouches[i];
        let v = document.elementFromPoint(element.clientX, element.clientY);
        if (v && v.classList.contains("node") && (!v.classList.contains("node-start") && (!v.classList.contains("node-finish")))) {
          const line = v.id.split("-");
          const row = parseInt(line[1]);
          const col = parseInt(line[2]);
          v.className = 'node node-wall';
          // results in more efficient results...why?
          // maybe cause pass by value returns a reference (like in java)????
          wallsGrid[row][col].isWall = !wallsGrid[row][col].isWall;
        }
      }
    }

    root!.onmousedown = (e) => {
      // breaks walls for  grid, do not remove
      // e.stopImmediatePropagation(); (didn't allow elements to be placed on first click)
      e.preventDefault();
      setMouseIsPressed(true);
    }
    /*
    root!.onmouseup = (e) => {
      // breaks walls grid, do not remove
      e.preventDefault();
      e.stopImmediatePropagation();
      setMouseIsPressed(false);
      setClickedOnStartNode(false);
      setClickedOnFinishNode(false);
    }
     */

    window.addEventListener('resize', () => {
      resizeGrid();
    }, true);
  }, [])

  const resizeGrid = () => {
    let COLS = cols;
    let mainContentWidth = document.getElementById("main")!.offsetWidth;
    let dimension = Math.floor(mainContentWidth / (COLS * 2.5)) + "px";
    setNodeStyle({width: dimension, height: dimension})
  }

  useEffect(() => {
    displayAlgorithms();
  }, [showAlgorithms])

  const showAlgorithmsDropdown = (e: React.MouseEvent) => {
    // ensures that you close menu when clicked again
    if (!showAlgorithms && !optionsDisabled) {
      setShowAlgorithms(true);
      // not sure why this works but will figure out soon
      // makes dropdown work magically!
      e.stopPropagation();
      document.addEventListener("click", closeAlgorithmsDropdown);
    }
  }

  const closeAlgorithmsDropdown = () => {
    setShowAlgorithms(false);
    document.removeEventListener("click", closeAlgorithmsDropdown)
  }

  const displayAlgorithms = () => {
    if (showAlgorithms) {
      dropdownSelection.current!.style.display = "block";
      dropdownCaret.current!.style.transform = "rotate(180deg)";
      dropdownCaret.current!.style.transition = "all 250ms linear";
    } else {
      dropdownSelection.current!.style.display = "none";
      dropdownCaret.current!.style.transform = "rotate(0deg)";
      dropdownCaret.current!.style.transition = "all 250ms linear";
    }
  }

  // run algorithms and navbar settings when options get disabled (aka algorithms is being ran)d
  useEffect(() => {
    if (clickedRun) {
      setOptionsDisabled(true);
      const startNode = grid[startRow][startCol];
      const finishNode = grid[finishRow][finishCol];
      switch (algorithm) {
        case 'DFS': {
          const visitedNodes = dfsVisited(startNode, finishNode, grid);
          const pathForDFS = dfsPath(finishNode);
          setVisitedNodes(visitedNodes);
          setPathNodes(pathNodes);
          animateVisited(visitedNodes, pathForDFS);
          break;
        }
        case 'BFS': {
          const visitedNodes = bfsVisited(startNode, finishNode, grid);
          const pathForBFS = bfsPath(finishNode);
          setVisitedNodes(visitedNodes);
          setPathNodes(pathNodes);
          animateVisited(visitedNodes, pathForBFS);
          break;
        }
        case 'Dijkstra': {
          const visitedNodes = dijkstraSP(startNode, finishNode, grid);
          const pathNodes = shortestPath(finishNode);
          setVisitedNodes(visitedNodes);
          setPathNodes(pathNodes);
          animateVisited(visitedNodes, pathNodes);
          break;
        }
      }
      setClickedRun(false);
    }
  }, [clickedRun]);

  // create walls on first click
  const handleMouseDown = (row: number, col: number) => {
    if (optionsDisabled) return;

    const nodeID = "node-" + row + "-" + col;
    const node = grid[row][col];
    const className = node.isStart ? 'node node-start' : node.isFinish ? 'node node-finish' : node.isWall ? 'node' : 'node-wall'
    document.getElementById(nodeID)!.className = className;

    if (node.isStart) {
      setClickedOnStartNode(true);
    }

    if (node.isFinish){
      setClickedOnFinishNode(true);
    }

    if (node.isStart || node.isFinish) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid as Node[][]);
  }

  // create walls on drag when mouse is clicked
  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || optionsDisabled) return;
    const nodeID = "node-" + row + "-" + col;
    const node = grid[row][col];

    // must be made in seperate inner if statements to ensure the statements ends and doesn't run the next if statements
    if (clickedOnStartNode) {
      if (!node.isWall && !node.isFinish){
        const prevStartNodeID = 'node-' + startRow + '-' + startCol;
        document.getElementById(prevStartNodeID)!.className = 'node';
        updateStartNode(row, col);
        document.getElementById(nodeID)!.className = 'node node-start';
      }
      return;
    }

    // must be made in seperate inner if statements to ensure the statements ends and doesn't run the next if statements
    if (clickedOnFinishNode) {
      if (!node.isWall && !node.isStart){
        const prevStartNodeID = 'node-' + finishRow + '-' + finishCol;
        document.getElementById(prevStartNodeID)!.className = 'node';
        updateFinishNode(row, col);
        document.getElementById(nodeID)!.className = 'node node-finish';
      }
      return;
    }

    // otherwise, fill the walls up, ensures that start/finish nodes cannnot be filled up
    if (!node.isStart && !node.isFinish) {
      document.getElementById(nodeID)!.className = node.isWall ? 'node' : 'node-wall';
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid as Node[][]);
    }
  }

  const getNewGridWithWallToggled = (grid: Node[][], row: number, col: number) => {
    return update(grid, {
      [row]: {[col]: {isWall: {$set: !grid[row][col].isWall}}}
    });
  }

  const updateStartNode = (row: number, col: number) => {
    setStartRow(row);
    setStartCol(col);
  }

  const updateFinishNode = (row: number, col: number) => {
    setFinishRow(row);
    setFinishCol(col);
  }

  const mazeGeneration = () => {
    setOptionsDisabled(true);
    setGrid(getInitialGrid);
    clearGrid();
    setDropdownStyle(disabledButtonStyle);
    // there has to be a timeout before generating the walls or else the walls will be generated instantly
    // this is because the state of a node is updated rather than a class being added when loading in nodes
    // this is just a simple fix, as it is a trivial issue
    const WALL_ANIMATION_LENGTH = 5;
    let {walls, mazeGrid} = recursiveDivision(getInitialGrid());
    let animationLength = walls.length * WALL_ANIMATION_LENGTH;

    // update grid with new walls grid
    setTimeout(() => {
      setGrid(mazeGrid);
    }, animationLength);

    enableSettings(animationLength)
    for (let i = 0; i < walls.length; i++) {
      const v = walls[i];
      // recursive division sets walls to true/false within the algorithm itself
      // therefore, if a node is a wall, then turn add it to wall class properties
      if (v.isWall) {
        setTimeout(() => {
          const nodeID = "node-" + v.row + "-" + v.col;
          document.getElementById(nodeID)!.className = 'node node-wall';
        }, i * WALL_ANIMATION_LENGTH)
      }
    }
  }

  const animateVisited = (visitedNodes: Node[], pathNodes: Node[]) => {
    let animationLength = (visitedNodes.length + pathNodes.length) * pathfindingSpeed;
    setDropdownStyle(disabledButtonStyle);
    enableSettings(animationLength);
    // must be <= visitedNodes.length to ensure that the for loop has finished
    for (let i = 0; i <= visitedNodes.length; i++) {
      if (i === visitedNodes.length) {
        setTimeout(() => {
          animatePath(pathNodes);
        }, i * pathfindingSpeed);
      } else {
        setTimeout(() => {
          const node = visitedNodes[i];
          const nodeID = "node-" + node.row + "-" + node.col;
          document.getElementById(nodeID)!.className = 'node node-visited';
        }, i * pathfindingSpeed);
      }
    }
  }

  const animatePath = (pathNodes: Node[]) => {
    for (let i = 0; i < pathNodes.length; i++) {
      setTimeout(() => {
        const node = pathNodes[i];
        const nodeID = "node-" + node.row + "-" + node.col;
        document.getElementById(nodeID)!.className = 'node node-shortest-path';
      }, i * pathfindingSpeed);
    }
  }

  const enableSettings = (animationLength: number) => {
    setTimeout(() => {
      setOptionsDisabled(false);
      setDropdownStyle(enabledButtonStyle);
    }, animationLength);
  }

  const clearGrid = () => {
    // clearing the actual grid itself
    setGrid(getInitialGrid);
    setPathNodes([]);
    setVisitedNodes([]);

    // clearing html class properties (for css)
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        const node = grid[i][j];
        const nodeID = "node-" + node.row + "-" + node.col;
        document.getElementById(nodeID)!.className = 'node';
      }
    }

    const startNode = grid[startRow][startCol];
    const startNodeID = 'node-' + startNode.row + '-' + startNode.col;
    document.getElementById(startNodeID)!.className = 'node node-start';

    const finishNode = grid[finishRow][finishCol];
    const finishNodeID = 'node-' + finishNode.row + '-' + finishNode.col;
    document.getElementById(finishNodeID)!.className = 'node node-finish';
  }

  const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
      const currentRow = [];
      for (let col = 0; col < cols; col++) {
        currentRow.push(createNode(row, col, false));
      }
      grid.push(currentRow);
    }
    return grid;
  }

  // used for when the start/finish nodes are moved, ensures that the grid is updated with correct values for
  // isStart and isFinish
  const getUpdatedGrid = () => {
    const updatedGrid = [];
    for (let row = 0; row < rows; row++) {
      const currentRow = [];
      for (let col = 0; col < cols; col++) {
        const node = grid[row][col];
        node.isWall ? currentRow.push(createNode(row, col, true)) : currentRow.push(createNode(row, col, false));
      }
      updatedGrid.push(currentRow);
    }
    return updatedGrid;
  }

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setGrid(getUpdatedGrid);
    setMouseIsPressed(false);
    setClickedOnStartNode(false);
    setClickedOnFinishNode(false);
  }

  const createNode = (row: number, col: number, wall: boolean) => {
    return {
      row: row,
      col: col,
      isStart: row === startRow && col === startCol,
      isFinish: row === finishRow && col === finishCol,
      weight: Infinity,
      isVisited: false,
      isWall: wall,
      previousNode: null
    } as Node;
  }

  let nodes = grid.map((row) => {
    return (
      <div className={"grid-row"}>
        {row.map((node) => {
          const {row, col, isFinish, isStart, isWall} = node;
          return (
            <GridNode row={row} col={col} isStart={isStart} isFinish={isFinish} isWall={isWall}
                      onMouseDown={() => handleMouseDown(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onTouchMove={() => handleMouseEnter(row, col)}
                      style={nodeStyle}
            />
          )
        })}
      </div>
    )
  })
  return (
    <main className={"main-sidebar"} id={"main"}>
      <div className={"sidebar"}>
        <div className={"sidebar-settings"}>
          <div className={"sidebar-setting"}>
            <p> Choose an algorithm </p>

            <div className={"selection-dropdown"} onClick={showAlgorithmsDropdown} style={dropdownStyle}>
              <div className={"current-option"}>
                <p> {algorithm} </p>
              </div>

              <div className={"caret-down"}>
                <i className="fas fa-caret-down" ref={dropdownCaret}> </i>
              </div>
            </div>
            <div className={"selection-options"} ref={dropdownSelection}>
              <ul>
                {
                  options.map(option => (
                    <div onClick={() => setAlgorithm(option)}
                         key={option}> {option} </div>
                  ))
                }
              </ul>
            </div>

            <AlgoButton buttonText={'Run'} disabled={optionsDisabled} onClick={() => setClickedRun(true)}/>
          </div>

          <AlgoButtonSetting settingDescription={'Recursive Backtrack Maze'} buttonText={'Generate Maze'}
                             disabled={optionsDisabled} onClick={mazeGeneration}/>

          <AlgoButtonSetting settingDescription={'Clear Grid'} buttonText={'Clear'}
                             disabled={optionsDisabled} onClick={clearGrid}/>

        </div>
      </div>

      <div className={"main-content"} id={"grid-wrapper"} onMouseUp={(e) => onMouseUp(e)}
           onMouseLeave={() => setMouseIsPressed(false)}>
        <div id={"grid"}>
          {nodes}
        </div>
      </div>
    </main>
  );
}

export default PathfindingVisualizer;

