import React, {ChangeEvent, createRef, useEffect, useState} from "react";
import "./SortingVisualizer.css";
import {getInsertionSortAnimations} from "./Algorithms/InsertionSort";
import {getBubbleSortAnimations} from "./Algorithms/BubbleSort";
import {getMergeSortAnimations} from "./Algorithms/MergeSort";
import {getQuickSortAnimations} from "./Algorithms/QuickSort";
import {getHeapSortAnimations} from "./Algorithms/HeapSort";
import {getSelectionSortAnimations} from "./Algorithms/SelectionSort";
import AlgoButton from "../Common/AlgoButton";
import AlgoButtonSetting from "../Common/Settings/AlgoButtonSetting";
import AlgoSliderSetting from "../Common/Settings/AlgoSliderSetting";
import {enabledButtonStyle, disabledButtonStyle} from "../Common/Styles";

// This is the main color of the array bars.
const PRIMARY_COLOR = '#98d6e8';

// This is the color of array bars that are being compared throughout the animations.
const SECONDARY_COLOR = '#33435d';

// sorting algorithms
const options = ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort", "Quick Sort", "Heap Sort"];

type Props = {};

function SortingVisualizer(props: Props) {
  const dropdownSelection = createRef<HTMLDivElement>();
  const dropdownCaret = createRef<HTMLDivElement>();
  const [arr, setArr] = useState<number[]>([]);
  const [numberOfBars, setNumberOfBars] = useState(100);
  const [sortingSpeed, setSortingSpeed] = useState(1);
  const [sortingAlgorithm, setSortingAlgorithm] = useState('Merge Sort');
  const [showSortingOptions, setShowSortingOptions] = useState(false);
  const [optionsDisabled, setOptionsDisabled] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(enabledButtonStyle);
  const [dropdownOptionClicked, setDropdownOptionClicked] = useState(false);
  const [clickedRun, setClickedRun] = useState(false);

  useEffect(() => {
    resetArray();
    window.addEventListener('resize', () => {
      resetArray();
    }, true);
  }, [])

  useEffect(() => {
    changeWidthBasedOnSize(arr);
  }, [arr])

  const resetArray = () => {
    // resize the array based on height of screen
    if (!optionsDisabled) {
      let screenHeight = document.getElementById("app-wrapper")!.clientHeight;
      let headerHeight = document.getElementById("header")!.clientHeight;
      let footerHeight = document.getElementById("footer")!.clientHeight;
      let containerHeight = screenHeight - headerHeight - footerHeight;
      containerHeight = containerHeight < 600 ? footerHeight * 8 : containerHeight < 200 ? 1 : containerHeight;
      let maxBarHeight = containerHeight - 200;
      let arr: number[] = [];
      for (let i = 0; i < numberOfBars; i++) {
        arr.push(randomIntFromInterval(5, maxBarHeight));
      }
      setArr(arr);
    }
  }

  // change width of bars
  const changeWidthBasedOnSize = (arr: number[]) => {
    if (arr.length <= 20) {
      changeBarsWidth(60)
    } else if (arr.length <= 40) {
      changeBarsWidth(35)
    } else if (arr.length <= 100) {
      changeBarsWidth(10);
    } else if (arr.length <= 150) {
      changeBarsWidth(8);
    } else if (arr.length <= 200) {
      changeBarsWidth(5);
    } else {
      changeBarsWidth(3);
    }
  }

  const changeBarsWidth = (width: number) => {
    let arrayBars = document.getElementsByClassName('array-bar');
    for (let i = 0; i < arrayBars.length; i++) {
      let bar = arrayBars[i] as HTMLElement;
      bar.style.width = width + "px";
    }
  }

  // displaying the settings
  useEffect(() => {
    // this ensures that the slider does not reset the array once the min/max is reached
    if (numberOfBars > 10 && numberOfBars < 250) {
      resetArray()
    }
  }, [numberOfBars])

  const barsLimit = (e: Event, value: number | number[]) => {
    setNumberOfBars(value as number);
  }

  const sliderSpeed = (e: Event, value: number | number[]) => {
    setSortingSpeed(value as number);
  }

  // methods for dropdown menu
  useEffect(() => {
    displaySortingAlgorithms()
  }, [showSortingOptions]);

  useEffect(() => {
    if (dropdownOptionClicked) {
      setDropdownOptionClicked(false);
    }
  }, [dropdownOptionClicked]);

  const showSortingAlgorithms = (e: React.MouseEvent) => {
    // ensures that you close menu when clicked again
    if (!showSortingOptions && !optionsDisabled) {
      setShowSortingOptions(true);
      // not sure why this works but will figure out soon
      // makes dropdown work magically!
      e.stopPropagation();
      document.addEventListener("click", closeSortingAlgorithms);
    }
  }

  const closeSortingAlgorithms = () => {
    setShowSortingOptions(false);
    document.removeEventListener("click", closeSortingAlgorithms)
  }

  const displaySortingAlgorithms = () => {
    if (showSortingOptions) {
      dropdownSelection.current!.style.display = "block";
      dropdownCaret.current!.style.transform = "rotate(180deg)";
      dropdownCaret.current!.style.transition = "all 250ms linear";
    } else {
      dropdownSelection.current!.style.display = "none";
      dropdownCaret.current!.style.transform = "rotate(0deg)";
      dropdownCaret.current!.style.transition = "all 250ms linear";
    }
  }

  // sorting animation algorithm
  const sortingAnimations = (arrs: [[number, number, string, string][], number[]]) => {
    let [animations, arr] = arrs;
    let animationLength = animations.length * sortingSpeed;
    enableSettings(animationLength, arr);

    for (let i = 0; i < animations.length; i++) {
      let arrayBars = document.getElementsByClassName('array-bar');
      let animationType = animations[i][2];
      switch (animationType) {
        case 'color': {
          let [barOneIdx, barTwoIdx] = animations[i];
          let barOne = arrayBars[barOneIdx] as HTMLElement;
          let barTwo = arrayBars[barTwoIdx] as HTMLElement;
          let colorState = animations[i][3];
          let color = colorState === 'insert' ? SECONDARY_COLOR : PRIMARY_COLOR;
          // keep track of timer to cancel timer operations once the component is unmounted
          let t = setTimeout(() => {
            if (barOne !== undefined) {
              barOne.style.backgroundColor = color;
              barTwo.style.backgroundColor = color;
            }
          }, i * sortingSpeed);

          // clear timeout if bars are undefined (component is unmounted)
          if (barOne === undefined) {
            clearTimeout(t);
          }
          break;
        }
        case 'swap': {
          const [barOneIdx, newHeight] = animations[i];
          const barOne = arrayBars[barOneIdx] as HTMLElement;
          // keep track of timer to cancel timer operations once the component is unmounted
          let t = setTimeout(() => {
            if (barOne !== undefined) {
              barOne.style.height = newHeight + `px`;
            }
          }, i * sortingSpeed);
          // clear timeout if bars are undefined (component is unmounted)
          if (barOne === undefined) {
            clearTimeout(t);
          }
          break;
        }
        case 'pivot': {
          let [barOneIdx, barTwoIdx] = animations[i];
          let barOne = arrayBars[barOneIdx] as HTMLElement;
          let barTwo = arrayBars[barTwoIdx] as HTMLElement;
          let colorState = animations[i][3];
          let color = colorState === 'insert' ? '#83f57f' : PRIMARY_COLOR;
          // keep track of timer to cancel timer operations once the component is unmounted
          let t = setTimeout(() => {
            if (barOne !== undefined || barTwo !== undefined) {
              barOne.style.backgroundColor = color;
              barTwo.style.backgroundColor = color;
            }
          }, i * sortingSpeed);
          // clear timeout if bars are undefined (component is unmounted)
          if (barOne === undefined || barTwo === undefined) {
            clearTimeout(t);
          }
          break;
        }
      }
    }
  }

  // run the sorting algorithm and disable buttons
  useEffect(() => {
    if (clickedRun) {
      setOptionsDisabled(true);
      setDropdownStyle(disabledButtonStyle);

      switch (sortingAlgorithm) {
        case 'Bubble Sort':
          sortingAnimations(getBubbleSortAnimations(arr));
          break;
        case 'Insertion Sort':
          sortingAnimations(getInsertionSortAnimations(arr));
          break;
        case 'Selection Sort':
          sortingAnimations(getSelectionSortAnimations(arr));
          break;
        case 'Merge Sort':
          sortingAnimations(getMergeSortAnimations(arr));
          break;
        case 'Quick Sort':
          sortingAnimations(getQuickSortAnimations(arr));
          break;
        case 'Heap Sort':
          sortingAnimations(getHeapSortAnimations(arr));
          break;
      }
      setClickedRun(false);
    }
  }, [clickedRun])

  // enable settings once the the animation is over
  const enableSettings = (animationLength: number, arr: number[]) => {
    setTimeout(() => {
      setOptionsDisabled(false);
      setDropdownStyle(enabledButtonStyle);
      setArr(arr);
    }, animationLength);
  }

  const onMouseEnterDropdown = () => {
    if (optionsDisabled) {
      setDropdownStyle({color: '#f5a0a0', cursor: 'default'});
    } else {
      setDropdownStyle({color: '#98d6e8', cursor: 'pointer'});
    }
  }

  const onMouseLeaveDropdown = () => {
    if (optionsDisabled) {
      setDropdownStyle({color: '#f5a0a0', cursor: 'default'});
    } else {
      setDropdownStyle({color: '#fff', cursor: 'pointer'});
    }
  }

  let bars = arr.map((value, idx) => (
    <div className="array-bar"
         key={idx}
         style={{backgroundColor: PRIMARY_COLOR, height: value + `px`}}>
    </div>
  ))

  return (
    <main className="main-sidebar">
      <div className={"sidebar-wrapper"}>
        <div className={"sidebar"}>
          <div className={"sidebar-settings"}>
            <AlgoSliderSetting settingDescription={"Control number of bars"}
                               statusDescription={numberOfBars + " bars"}
                               disabled={optionsDisabled}
                               onChange={barsLimit} defaultValue={100} min={10} max={250}/>

            <AlgoSliderSetting settingDescription={"Control visualizer speed"}
                               statusDescription={sortingSpeed + " ms"}
                               disabled={optionsDisabled}
                               onChange={sliderSpeed} defaultValue={1} min={1} max={100}/>

            <div className={"sidebar-setting"}>
              <p> Choose an algorithm </p>

              <div className={"selection-dropdown"} style={dropdownStyle} onClick={showSortingAlgorithms}
                   onMouseEnter={onMouseEnterDropdown} onMouseLeave={onMouseLeaveDropdown}>
                <div className={"current-option"}>
                  <p> {sortingAlgorithm} </p>
                </div>

                <div className={"caret-down"}>
                  <i className="fas fa-caret-down" ref={dropdownCaret}> </i>
                </div>
              </div>
              <div className={"selection-options"} ref={dropdownSelection}>
                <ul>
                  {
                    options.map(option => (
                      <div onClick={() => {
                        setSortingAlgorithm(option);
                        setDropdownOptionClicked(true);
                      }}
                           key={option}> {option} </div>
                    ))
                  }
                </ul>
              </div>

              <AlgoButton buttonText={"Run"} disabled={optionsDisabled}
                          onClick={() => setClickedRun(true)}/>
            </div>

            <AlgoButtonSetting settingDescription={"Reset the array"} buttonText={"Reset"}
                               disabled={optionsDisabled} onClick={resetArray}/>
          </div>
        </div>
      </div>

      <div className={"main-content"}>
        <div id={"sorting-visualizer"}>
          {bars}
        </div>
      </div>
    </main>
  );
}

export default SortingVisualizer;

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
