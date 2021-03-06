import React from "react";
import "./Home.css";
import {Link} from "react-router-dom"

function Home() {
  return (
    <div id={"home-wrapper"}>
      <h1 id={"home-header-text"}> Visualizing made easy. </h1>
      <p id={"home-text"}>
        This is my first big project, please feel free to explore the beautiful visualization
        of sorting and pathfinding algorithms by clicking one of the buttons below.
      </p>

      <div id={"buttons-menu"}>
        <Link to={"/AlgoVisual/sorting"}>
          <div className={"home-section"}> Sorting Algorithms</div>
        </Link>

        <Link to={"/AlgoVisual/pathfinding"}>
          <div className={"home-section"}> Pathfinding Algorithms</div>
        </Link>
      </div>
    </div>
  )
}

export default Home;
